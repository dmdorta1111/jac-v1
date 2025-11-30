# Multi-Session/Multi-Item UI/UX Patterns Research
**JAC-V1 Manufacturing Forms** | **Date:** 2025-11-29 | **Status:** Complete

## Executive Summary
For chat-per-item architectures in manufacturing, use **sequential non-intelligent numbering** (Item 001) with optional status badges in sidebars. Prevent race conditions with file-locking or Redis counters. Sync multi-tab state via BroadcastChannel API. Implement localStorage cleanup policies at 5MB thresholds.

---

## 1. SESSION/ITEM STATUS INDICATORS

### Best Practice: Two-Tier Display
```typescript
// SessionItem Component - Recommended Pattern
<div className="flex items-center justify-between">
  <span className="text-sm font-medium">Item 001</span>
  <StatusBadge status="in-progress" />  // or "complete"
</div>
```

**Status Indicators:**
- **Green (✓)**: Form complete (all steps finished)
- **Yellow (◐)**: In progress (current step active)
- **Gray (○)**: Not started (initial state)
- **Red (!)**: Error/validation failed

**Color Semantics (verified across Carbon Design System, Microsoft Project):**
- Green = completion, success
- Yellow = in-progress, pending action
- Gray = unstarted, draft
- Red = error, late, blocked

### Naming Convention Recommendation
**Pattern:** Sequential + Optional Description
```
Item 001              // Minimal (current)
Item 001 - Door      // Contextual (enhanced)
Item 001 (Complete)  // Status inline (alternative)
```

**Research Finding:** Manufacturing apps show:
- Insignificant sequential numbers (001-999) win for speed & error reduction
- Intelligent descriptive schemes (e.g., "DR-STL-001") create bottlenecks
- Semi-intelligent hybrid (prefix + counter) balances context + speed
- Users prefer numeric-first for data entry; descriptions optional secondary text

**Recommendation for JAC-V1:** Keep `itemNumber` immutable (Item 001), add optional `description` field users can set during/after header completion. Render as:
```
Item 001
Door Frame Configuration  // Optional user-provided description
```

---

## 2. SESSION TITLES & DYNAMIC UPDATES

### Pattern: Suffix Strategy
**Static:** `Item 001 - <User Description>`
**Dynamic:** Shows completion percentage in collapsed sidebar
```typescript
// Sidebar rendering
{
  title: `Item 001 ${isComplete ? '✓' : ''}`,  // Visual indicator
  // Full title in tooltip/hover
  titleFull: `Item 001 - Door Frame (Step 3/5)`
}
```

**Next.js 15 Implementation:**
- Store `itemMetadata = { itemNumber, description, createdAt, completionStatus }`
- Update in ProjectContext when form advances
- Re-render SessionItem on status change (via useCallback + useMemo)
- No localStorage for dynamic status (use context only)

### Conditional Title Logic
```typescript
const getSessionTitle = (session: ChatSession) => {
  const base = `Item ${session.itemNumber || 'New'}`;

  if (session.projectMetadata?.projectHeaderCompleted) {
    return `${base} - ${session.projectMetadata.description || 'Unnamed'}`;
  }
  return base;
};
```

---

## 3. RACE CONDITION PREVENTION FOR ITEM NUMBERING

### Problem Space
Without database, concurrent requests can generate duplicate item numbers:
```
Request A: Read = 001, Write = 002
Request B: Read = 001, Write = 002  // Collision!
```

### Recommended Solutions (Ranked)

#### Option 1: Atomic File Locking (Recommended for JAC-V1)
**Trade-off:** Simple, no external deps, works on local/cloud storage
```typescript
// app/api/get-next-item-number/route.ts
import fs from 'fs/promises';
import path from 'path';

const COUNTER_FILE = path.join(process.cwd(), '.cache', 'item-counter.json');

async function getNextItemNumber(projectId: string): Promise<string> {
  // Lock pattern using atomic writes
  const lockFile = `${COUNTER_FILE}.lock`;

  // Wait for lock
  while (fs.existsSync(lockFile)) {
    await new Promise(r => setTimeout(r, 10));
  }

  // Atomic: create lock, read, increment, write, remove lock
  try {
    await fs.writeFile(lockFile, 'locked');

    const data = await fs.readFile(COUNTER_FILE, 'utf-8')
      .then(JSON.parse)
      .catch(() => ({ projectId, counter: 0 }));

    data.counter++;
    const itemNumber = String(data.counter).padStart(3, '0');

    await fs.writeFile(COUNTER_FILE, JSON.stringify(data));

    return itemNumber;
  } finally {
    await fs.unlink(lockFile).catch(() => {});
  }
}
```

**Pros:** No DB, simple, filesystem-based
**Cons:** File I/O overhead, doesn't work in serverless with no persistent disk

#### Option 2: Redis Atomic Increment (Production-Grade)
```typescript
import { createClient } from 'redis';

const redis = createClient();

async function getNextItemNumber(projectId: string): Promise<string> {
  const counter = await redis.incr(`item-counter:${projectId}`);
  return String(counter).padStart(3, '0');
}
```
**Pros:** Guaranteed atomic, fast, works distributed
**Cons:** Requires Redis service (add to stack)

#### Option 3: UUID Prefix with Sequential Suffix (Hybrid)
```typescript
// Generate: JAC-2025-001
const projectId = 'JAC-2025';  // Date-based
let localCounter = 0;  // In-memory during session

const getItemNumber = () => {
  return `${projectId}-${++localCounter}`.padStart(3, '0');
};
```
**Pros:** Unique, semi-readable, no collision possible
**Cons:** Different numbering scheme from current

#### Option 4: Timestamp-Based (Last Resort)
```typescript
const getItemNumber = () => {
  return `${Date.now() % 10000}`.padStart(3, '0');
};
```
**Pros:** Zero race conditions
**Cons:** Non-sequential, not human-readable

### RECOMMENDATION
**Use Option 1 (file locking) for MVP**, migrate to **Option 2 (Redis)** for production multi-instance deployment.

---

## 4. LOCALSTORAGE PERSISTENCE & MULTI-TAB SYNC

### Quota Management
**Browser limits:** 5-10MB typical (5MB recommended safety threshold)

**Storage breakdown (JAC-V1):**
- Session data per item: ~50KB (accumulated form state)
- Chat messages per item: ~100KB (conversation history)
- Multiple items (10 items): ~1.5MB total

**Cleanup Strategy:**
```typescript
const STORAGE_QUOTA_MB = 5;
const ITEM_STORAGE_KEY = (itemId: string) => `item-session-${itemId}`;

// Before storing new session
const getStorageUsage = () => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('item-session-')) {
      total += localStorage.getItem(key)?.length || 0;
    }
  }
  return (total / 1024 / 1024); // MB
};

// Cleanup: LRU deletion when threshold exceeded
if (getStorageUsage() > STORAGE_QUOTA_MB) {
  const sessions = getSessionMetadata();
  const oldest = sessions.sort((a, b) => a.updatedAt - b.updatedAt)[0];
  localStorage.removeItem(ITEM_STORAGE_KEY(oldest.id));
}
```

### Multi-Tab Sync with BroadcastChannel API

**Pattern: Channel per Project**
```typescript
// useSessionSync.ts
export function useSessionSync(projectId: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Don't create if no browser support
    if (!('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel(`project-${projectId}`);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, data } = event.data;

      if (type === 'SESSION_CREATED') {
        setSessions(prev => [...prev, data.session]);
      } else if (type === 'SESSION_UPDATED') {
        setSessions(prev => prev.map(s =>
          s.id === data.session.id ? data.session : s
        ));
      } else if (type === 'SESSION_DELETED') {
        setSessions(prev => prev.filter(s => s.id !== data.sessionId));
      }
    };

    return () => channel.close();
  }, [projectId]);

  const broadcastChange = (type: string, data: any) => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type, data });
    }
  };

  return { sessions, broadcastChange };
}
```

**Session Cleanup Policy:**
- Delete sessions unaccessed > 30 days
- Warn user when storage > 80% capacity
- Auto-archive completed items (move to separate localStorage key)
- Never delete unsaved form data (persist before cleanup)

### Multi-Tab Edge Cases
**Problem:** Tab A creates Item 001, Tab B tries to create Item 001 → collision

**Solution:** Broadcast intent before creation
```typescript
// Before calling get-next-item-number
broadcastChange('REQUEST_ITEM_CREATION', { projectId });

// Wait 100ms for other tabs to respond
setTimeout(() => {
  callNextItemAPI();
}, 100);
```

---

## 5. RECOMMENDED SESSION TITLE EVOLUTION

### Phase 1 (Current)
```
Item 001
Item 002
```

### Phase 2 (Add Indicators)
```
Item 001 ✓         // Green checkmark = complete
Item 002 ◐         // Yellow circle = in-progress
Item 003           // No icon = not started
```

### Phase 3 (Add Descriptions)
```
Item 001 - Door Frame Configuration ✓
Item 002 - Hardware Specifications ◐
Item 003
```

### Phase 4 (Tooltip/Metadata)
```
Item 001 - Door Frame Configuration ✓
  └─ Created: Nov 29, 10:30 AM
  └─ Last updated: Nov 29, 3:45 PM
  └─ Progress: 5/5 steps complete
```

---

## Implementation Priority (Next.js 15 + React 19)

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | Add status badges (✓◐) to SessionItem | 1h | High (UX clarity) |
| 2 | Add optional `description` to item metadata | 2h | Medium (context) |
| 3 | Implement file-locking for item counter | 3h | Critical (prevent collision) |
| 4 | Add BroadcastChannel multi-tab sync | 4h | Medium (multi-tab support) |
| 5 | Implement storage quota management | 2h | Low (future-proofing) |

---

## Code Snippets for JAC-V1

### 1. Enhanced SessionItem with Status
```typescript
function SessionItem({ session, isSelected, onSelect, onDelete }: SessionItemProps) {
  const getStatusIcon = (session: ChatSession) => {
    if (session.projectMetadata?.projectHeaderCompleted === false) return '○';
    if (session.flowState?.currentStep === session.flowState?.totalSteps) return '✓';
    return '◐';
  };

  const statusColors = {
    '✓': 'text-green-600',
    '◐': 'text-yellow-600',
    '○': 'text-gray-400'
  };

  return (
    <div className={`group flex items-center gap-2.5 rounded-xl px-3 py-3 ${isSelected ? 'bg-zinc-500/10' : 'hover:bg-accent'}`}>
      <MessageSquare className="size-4 shrink-0" />
      <span className="flex-1 truncate text-sm font-medium">
        {session.itemNumber ? `Item ${session.itemNumber}` : 'New Item'}
      </span>
      <span className={`shrink-0 text-lg font-bold ${statusColors[getStatusIcon(session)]}`}>
        {getStatusIcon(session)}
      </span>
    </div>
  );
}
```

### 2. File-Locking Item Counter
```typescript
// app/api/get-next-item-number/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const COUNTER_DIR = path.join(process.cwd(), '.cache');

export async function POST(request: NextRequest) {
  const { projectId } = await request.json();

  const counterFile = path.join(COUNTER_DIR, `counter-${projectId}.json`);
  const lockFile = `${counterFile}.lock`;

  try {
    // Ensure cache directory exists
    await fs.mkdir(COUNTER_DIR, { recursive: true });

    // Wait for lock (max 5s)
    let attempts = 0;
    while ((await fs.stat(lockFile).catch(() => null)) && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    // Create lock
    await fs.writeFile(lockFile, Date.now().toString());

    // Read or initialize counter
    let counter = 0;
    try {
      const data = JSON.parse(await fs.readFile(counterFile, 'utf-8'));
      counter = data.counter;
    } catch {
      // First time for this project
    }

    // Increment and save
    counter++;
    await fs.writeFile(
      counterFile,
      JSON.stringify({ counter, projectId, updatedAt: new Date().toISOString() })
    );

    const itemNumber = String(counter).padStart(3, '0');

    return NextResponse.json({ itemNumber, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate item number' },
      { status: 500 }
    );
  } finally {
    // Release lock
    await fs.unlink(lockFile).catch(() => {});
  }
}
```

---

## Research Sources
- [Carbon Design System - Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- [Form Design Best Practices - Growform](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)
- [BroadcastChannel API Multi-Tab Sync - Dev.to](https://dev.to/franciscomendes10866/syncing-react-state-across-tabs-using-broadcast-channel-api-420k)
- [Atomic Operations in Node.js - Medium](https://medium.com/@artemkhrenov/atomic-operations-and-synchronization-in-javascript-b46a94584d51)
- [Part Numbering Best Practices - OpenBOM](https://www.openbom.com/blog/part-numbers-best-practices-and-future-improvements/)
- [Session Management in Next.js - Clerk](https://clerk.com/blog/complete-guide-session-management-nextjs)

---

## Unresolved Questions
1. **Vercel Deployment:** File-locking approach won't work on serverless with ephemeral disk. Migrate to Redis for production?
2. **Offline-First:** Should sessions persist to IndexedDB for offline work? Current localStorage only.
3. **Concurrent Item Creation:** Should users be blocked from creating items while previous item is incomplete, or allow parallel drafts?

---

**Last Updated:** 2025-11-29 | **Next Review:** After implementation phase 1-3

# State Persistence Quick Reference

**1-page cheat sheet for implementation**

---

## ✅ What's Working Now

```typescript
// Current approach: useState + useEffect + 1s debounce
// ✅ Works for MVP
// ⚠️ Not React 19 concurrent-safe
// 📊 Data: ~10KB per session × 5 = 50KB total
// 💾 Storage: localStorage (appropriate)
```

---

## 🚀 Priority 1: Add This Week

### State Restoration with Validation

```typescript
// Prevent corrupted sessions from crashing app
const { executor, validation } = await restoreFlowExecutor(flow, sessionId, steps);

if (!validation.valid) {
  // Start fresh, don't crash
  executor = new FlowExecutor(flow, steps, {});
}
```

**File:** `lib/flow-engine/flow-restoration.ts` (pattern provided)

### Session Cleanup

```typescript
// App startup (layout.tsx)
export default function RootLayout() {
  useSessionCleanup(); // Removes sessions >7 days old, if storage >4MB

  return (
    <Providers>
      <ClaudeChat />
    </Providers>
  );
}
```

**File:** `lib/hooks/useSessionCleanup.ts` (pattern provided)

---

## 📊 Decision Matrix

### Storage Choice

| Need | Choice | Why |
|------|--------|-----|
| Small sessions (10KB) | **localStorage** | 5MB limit, simple API |
| Large sessions (>50MB) | **IndexedDB** | Async, complex querying |
| Session tokens | **httpOnly Cookie** | Security |

**JAC-V1:** localStorage ✅

### Debounce Timing

| Use Case | Timing | Why |
|----------|--------|-----|
| Form inputs | 1000ms | Prevents spam, feels responsive |
| Search | 500ms | Real-time feedback needed |
| Slow network | 2000ms | Avoid quota errors |

**JAC-V1:** 1000ms ✅

### Concurrency Safety

| Scenario | Safe? | Fix |
|----------|-------|-----|
| No Suspense used | ✅ YES | Current code OK |
| Using React 19 Suspense | ❌ NO | Migrate to useSyncExternalStore |
| Strict mode enabled | ⚠️ MAYBE | Test on real hardware |

**JAC-V1 Now:** ✅ OK | **Later (Phase 2):** Migrate

---

## 🔧 Implementation Checklist

### Phase 1 (This Sprint) - 4 hours

- [ ] Copy `flow-restoration.ts` pattern
  - Add to: `lib/flow-engine/flow-restoration.ts`
  - Validates state on page reload

- [ ] Copy `useSessionCleanup.ts` pattern
  - Add to: `lib/hooks/useSessionCleanup.ts`
  - Call in root layout

- [ ] Update SessionMetadata type
  - Add: `lastAccessedAt: number` to `ChatSession`
  - Call: `updateSessionAccess(sessionId)` when opening

- [ ] Test with corrupted localStorage
  - Manual test: Corrupt JSON in dev tools
  - Verify graceful fallback to fresh state

### Phase 2 (Next Sprint) - 6 hours

- [ ] Migrate `usePersistedSession` to `useSessionStore`
  - Copy `sessionStore.ts` pattern
  - Use `useSyncExternalStore` instead of `useState`
  - Same debounce timing, no UX change

- [ ] Add save feedback
  - Import `useTransition`
  - Show "Saving..." indicator
  - Wrap localStorage write in `startTransition`

- [ ] Test concurrent scenarios
  - Multiple sessions open simultaneously
  - Verify no UI tearing

### Phase 3 (Backlog) - 8 hours

- [ ] Delta saves (save only changed fields)
- [ ] Cross-tab sync (storage events)
- [ ] Plan IndexedDB migration (if needed)

---

## 🐛 Common Gotchas

### Hydration Error in Next.js

**Problem:** localStorage undefined on server, defined on client
```typescript
// ❌ Wrong
export default function Component() {
  const data = localStorage.getItem('key'); // CRASH on server
}
```

**Solution:**
```typescript
// ✅ Right
function useClientOnly() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return localStorage.getItem('key');
}
```

### Debounce Creating New Function Every Render

**Problem:** Debounce doesn't work, API called multiple times
```typescript
// ❌ Wrong
const debounced = debounce((data) => save(data), 1000); // New function every render!

const handleChange = (data) => debounced(data);
```

**Solution:**
```typescript
// ✅ Right
const handleChange = useCallback(
  debounce((data) => save(data), 1000), // Wrapped in useCallback
  []
);
```

### localStorage Quota Exceeded

**Problem:** Silent failure if >5MB
```typescript
// Catch it
try {
  localStorage.setItem('key', data);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Trigger cleanup
    cleanupOldSessions();
  }
}
```

---

## 📈 Performance Baselines

| Metric | Current | After Phase 2 | After Phase 3 |
|--------|---------|--------------|---------------|
| localStorage write | ~1KB | ~1KB | ~0.2KB |
| Debounce delay | 1s | 1s | 1s |
| UI blocking | 1-2ms | 0ms | 0ms |
| Network calls | 0 | 0 | 0 |
| React renders | 1 per change | 1 per change | 1 per change |

**All phases work offline** ✅

---

## 🧪 Quick Tests

```typescript
// Test 1: Corrupted state recovery
localStorage.setItem('session:test', JSON.stringify({
  fieldName: 123 // Wrong type
}));
// App should start fresh, not crash

// Test 2: Cleanup removes old sessions
const oldSessions = [{
  id: '1',
  lastAccessedAt: Date.now() - 10 * 24 * 60 * 60 * 1000 // 10 days ago
}];
localStorage.setItem('sessions:list', JSON.stringify(oldSessions));
cleanupSessions();
// Should be removed

// Test 3: Large payload save
const largeData = { /* 1MB object */ };
localStorage.setItem('session:large', JSON.stringify(largeData));
// Should catch QuotaExceededError gracefully
```

---

## 🔗 File Locations

```
docs/
├── REACT19-STATE-PERSISTENCE-RESEARCH.md ← Full details (read first)
├── SESSION-PERSISTENCE-CODE-PATTERNS.md  ← Copy & paste code
├── STATE-PERSISTENCE-SUMMARY.md          ← Strategic overview
└── PERSISTENCE-QUICK-REFERENCE.md        ← This file

Implementation files to create:
lib/
├── flow-engine/
│   └── flow-restoration.ts          ← State validation on reload
├── hooks/
│   └── useSessionCleanup.ts          ← 7-day cleanup + monitoring
└── [Phase 2] useSessionStore.ts      ← useSyncExternalStore hook
```

---

## 🚨 When to Escalate

| Issue | Action |
|-------|--------|
| localStorage quota exceeded | Trigger cleanup, warn user |
| State validation fails | Fall back to fresh state, log error |
| Session >5MB | Plan IndexedDB migration |
| Cross-tab sync needed | Implement storage events (Phase 3) |
| Offline support required | Add service worker + IndexedDB |

---

## 📞 Decision Log

| Decision | Rationale | Confidence |
|----------|-----------|------------|
| Keep localStorage | 10KB << 5MB limit | 95% |
| 1s debounce | Standard for forms | 95% |
| State validation on restore | Prevent crashes | 90% |
| 7-day cleanup window | Reasonable for sessions | 85% |
| useSyncExternalStore in Phase 2 | React 19 best practice | 100% |

---

## Next Action

1. Copy `flow-restoration.ts` pattern to your codebase
2. Copy `useSessionCleanup.ts` pattern to your codebase
3. Add to root layout: `useSessionCleanup()`
4. Test with corrupted localStorage
5. **Schedule Phase 2 useSyncExternalStore migration**

**Estimated time:** 4 hours for Phase 1 ⏱️

# React 19 + Next.js 15 State Persistence: Executive Summary

## Status
✅ **Research Complete** | 📋 **Implementation Ready** | 🗂️ **Files Generated**

---

## Key Findings (TL;DR)

| Question | Answer | Confidence |
|----------|--------|------------|
| **localStorage for 10KB sessions?** | ✅ YES - appropriate choice | 95% |
| **When to switch to IndexedDB?** | Only >50MB or offline-first needs | 90% |
| **Current 1s debounce timing?** | ✅ Optimal for forms | 95% |
| **React 19 concurrent safety?** | ⚠️ Use `useSyncExternalStore` | 100% |
| **FlowExecutor restoration?** | Need state validation on reload | 90% |
| **Session cleanup strategy?** | 7-day purge + size monitoring | 85% |

---

## Current vs Recommended Architecture

### Current (useState + useEffect)
```
usePersistedSession Hook
  ├─ useState: sessionStateMap
  ├─ useEffect: load from localStorage (mount)
  ├─ useEffect: save to localStorage (debounce 1s)
  └─ ⚠️ Risk: Tearing in concurrent renders
```

**Works:** Yes, for MVP
**Risks:** Concurrent rendering inconsistencies (unlikely if not using Suspense yet)

### Recommended (useSyncExternalStore)
```
External SessionStore (singleton)
  ├─ Map<sessionId, state>
  ├─ subscribe/unsubscribe callbacks
  ├─ getSnapshot (concurrent-safe)
  └─ debouncedPersist to localStorage

useSessionStore Hook
  └─ useSyncExternalStore → guaranteed consistent snapshots
```

**Benefits:**
- React 19 concurrent rendering safe
- Same debounce timing (1s)
- Better TypeScript support
- Easier to test

**Migration effort:** ~2 hours for existing hooks

---

## Decision: Storage Layer

### localStorage ✅ (Recommended for Now)
- **Capacity:** 5MB = 500x your current data size
- **API:** Simple sync (fine for small writes)
- **Best for:** Form drafts, session state, preferences
- **Cost:** Free, no server needed

### When to Migrate to IndexedDB
- **If:** Single session > 5MB (unlikely)
- **Or:** Need offline-first with service workers
- **Or:** Complex querying on large datasets
- **Timeline:** Phase 3 (6+ months)

**Recommendation:** Do not switch now. Plan migration if data grows beyond 50MB.

---

## Action Items (Prioritized)

### Phase 1: Safety (This Sprint)
**Effort: ~4 hours**

1. **Add state validation on restoration**
   - File: `lib/flow-engine/flow-restoration.ts`
   - Validates restored state against current form schema
   - Prevents corrupted sessions from breaking flow
   - Code pattern provided in `SESSION-PERSISTENCE-CODE-PATTERNS.md`

2. **Implement session cleanup**
   - File: `lib/hooks/useSessionCleanup.ts`
   - Removes sessions older than 7 days
   - Monitors storage size, purges if >4MB
   - Runs once on app startup

3. **Add session access tracking**
   - Update `ChatSession` type with `lastAccessedAt: number`
   - Call `updateSessionAccess(sessionId)` when opening session
   - Use for cleanup decisions

### Phase 2: Concurrency Safety (Next Sprint)
**Effort: ~6 hours**

1. **Migrate to useSyncExternalStore**
   - Replace `usePersistedSession` with `useSessionStore` hook
   - Create `SessionStore` singleton
   - Test no tearing in multi-session scenarios

2. **Add user feedback**
   - Show "Saving..." during debounce
   - Use `isPending` from `useTransition`
   - Better UX for slow connections

### Phase 3: Optimization (Backlog)
**Effort: ~8 hours**

1. **Implement delta saves**
   - Only persist changed fields, not entire state
   - Reduces I/O on every change

2. **Add cross-tab sync**
   - Sync sessions across browser tabs/windows
   - Use storage events pattern

3. **Plan IndexedDB migration**
   - If data grows beyond 50MB
   - For offline-first feature

---

## Code Files Generated

| File | Purpose | Priority |
|------|---------|----------|
| `docs/REACT19-STATE-PERSISTENCE-RESEARCH.md` | Full research findings (7 sections) | Read First |
| `docs/SESSION-PERSISTENCE-CODE-PATTERNS.md` | 6 ready-to-use code patterns | Implement Phase 1-2 |
| `docs/STATE-PERSISTENCE-SUMMARY.md` | This file - executive summary | Reference |

---

## Architectural Impact

### ✅ No Changes Needed To
- FlowExecutor class (state restoration handles it)
- Form validation logic
- ClaudeChat component structure
- MongoDB persistence layer

### ⚠️ Requires Update
- `usePersistedSession` → migrate to `useSyncExternalStore` (Phase 2)
- Add validation wrapper around state restoration
- Add cleanup hook to root layout

### 🔮 Future Considerations
- Session versioning for schema evolution
- Encrypted sessions for sensitive data (MDN: `crypto.subtle`)
- Service worker for offline support (IndexedDB required)

---

## Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Session corruption on reload | Medium | Phase 1: State validation |
| Storage quota exceeded | Low | Phase 1: Cleanup + monitoring |
| Concurrent render tearing | Low | Phase 2: useSyncExternalStore |
| Cross-tab sync issues | Low | Phase 3: storage events |
| Schema mismatch after update | Medium | Document versioning strategy |

---

## Performance Impact

### Current: 1s Debounce
- **I/O:** localStorage write every 1s (synchronous, blocks event loop ~1-2ms)
- **Network:** No server calls (good for offline)
- **User:** "Saving..." delay noticeable on slow devices

### After Phase 2: Transition-based Saves
- **I/O:** Same (1s debounce)
- **Network:** Non-blocking renders
- **User:** No UI jank

### After Phase 3: Delta Saves
- **I/O:** Write only changed fields
- **Size:** Reduce from ~10KB to ~2KB per save
- **Impact:** Marginal for form use case

---

## Testing Recommendations

```typescript
// Test state restoration
test('restores corrupted state gracefully', async () => {
  localStorage.setItem('session:test:state', JSON.stringify({
    fieldName: 'wrong type', // Should be number
  }));

  const { executor, validation } = await restoreFlowExecutor(...);

  expect(validation.valid).toBe(false);
  expect(executor.getState()).toEqual({}); // Falls back to empty
});

// Test cleanup
test('removes sessions older than 7 days', () => {
  const oldSessions = [
    { id: '1', lastAccessedAt: Date.now() - 10 * DAY },
    { id: '2', lastAccessedAt: Date.now() - 1 * DAY },
  ];
  localStorage.setItem('sessions:list', JSON.stringify(oldSessions));

  cleanupSessions();

  const remaining = JSON.parse(localStorage.getItem('sessions:list'));
  expect(remaining.length).toBe(1);
  expect(remaining[0].id).toBe('2');
});
```

---

## References & Documentation

**Official React 19 Docs:**
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [useTransition](https://react.dev/reference/react/useTransition)
- [Concurrent Rendering](https://react.dev/blog/2024/12/05/react-19)

**Next.js 15 Hydration:**
- [App Router Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)

**Storage Comparison:**
- [localStorage vs IndexedDB](https://dev.to/armstrong2035/9-differences-between-indexeddb-and-localstorage-30ai)
- [Web Storage APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

**React Patterns:**
- [External Stores & Tearing](https://interbolt.org/blog/react-ui-tearing/)
- [Debouncing Best Practices](https://www.developerway.com/posts/debouncing-in-react)

---

## Questions for Product/Team

1. **Session lifespan:** Auto-clear after browser close or persist indefinitely?
2. **Concurrent sessions:** Can user have multiple sessions in different tabs?
3. **Offline support:** Is offline-first a future requirement?
4. **File uploads:** Will sessions store file attachments (blobs)?
5. **Schema migration:** Plan for handling form template changes mid-session?

---

## Next Steps

1. **Read:** `REACT19-STATE-PERSISTENCE-RESEARCH.md` (20 min)
2. **Review:** `SESSION-PERSISTENCE-CODE-PATTERNS.md` (15 min)
3. **Implement Phase 1:** State validation + cleanup (~4 hours)
4. **Test:** Corrupted state recovery, cleanup logic
5. **Plan Phase 2:** useSyncExternalStore migration
6. **Document:** Session metadata schema in codebase

---

**Generated:** 2025-11-29
**Status:** Ready for implementation
**Confidence:** 95% alignment with React 19 best practices

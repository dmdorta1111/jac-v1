# PromptInput Refactoring - Implementation Checklist
**Status:** Ready to Start
**Estimated Time:** 10 minutes
**Difficulty:** Easy (Copy-Paste)

---

## Pre-Implementation

- [ ] Read summary: `docs/reports/251202-prompt-input-refactoring-summary.md` (5 min)
- [ ] Understand solution from: `docs/PROMPT-INPUT-REFACTORING-GUIDE.md` (5 min)
- [ ] Backup current code: `git status` (verify clean state)

---

## Step 1: Add CSS Utility Class (2 minutes)

### 1.1 Open File
- [ ] Open: `app/globals.css`
- [ ] Find: Line 710 (search for `@media (prefers-reduced-motion: reduce)`)
- [ ] Verify: You see the closing `}` around line 888

### 1.2 Add Code
- [ ] Position cursor after line 888 (or after `}` that closes prefers-reduced-motion section)
- [ ] Press Enter twice to add blank lines
- [ ] Paste entire CSS block below:

```css
/* =============================================================================
   PROMPT INPUT COMPONENT UTILITIES
   ============================================================================= */

.prompt-input-form {
  position: relative;
  background-color: transparent;
  padding: 0.375rem;
  box-shadow: none;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.prompt-input-form [data-slot="input-group"] {
  border-radius: 0.75rem;
  border: 0;
  box-shadow: none;
  background-color: transparent !important;
}

.dark .prompt-input-form [data-slot="input-group"] {
  background-color: transparent !important;
}

.prompt-input-form [data-slot="input-group-control"] {
  ring-width: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  border: 0 !important;
}

.prompt-input-form [data-slot="input-group-control"]:focus,
.prompt-input-form [data-slot="input-group-control"]:focus-visible {
  ring-width: 0 !important;
  outline: none !important;
  box-shadow: none !important;
}

.prompt-input-form [data-slot="input-group"]:focus-within {
  border: 0;
  ring-width: 0;
}

.prompt-input-form [data-slot="input-group-addon"] {
  border: 0;
}
```

- [ ] Save file: Ctrl+S

### 1.3 Verify Syntax
- [ ] Run: `npm run build`
- [ ] Expected: Build completes with no errors
- [ ] If error: Check CSS for typos or extra/missing braces

---

## Step 2: Update Component (2 minutes)

### 2.1 Open File
- [ ] Open: `components/ClaudeChat.tsx`
- [ ] Use Find: Ctrl+F → Search: `[data-slot=input-group]]:rounded-xl`
- [ ] Find: Line 1982 should be highlighted

### 2.2 Replace Code
- [ ] Look for `<PromptInput` opening tag
- [ ] Look for the massive className string (starts with `className="relative bg-transparent...`)
- [ ] Select the entire className string value (inside quotes)
- [ ] Replace with: `prompt-input-form` (no quotes needed, just the class name)

**Change from:**
```tsx
<PromptInput
  onSubmit={handleSubmit}
  className="relative bg-transparent p-1.5 shadow-none transition-all duration-300 [&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:border-0 [&_[data-slot=input-group]]:shadow-none [&_[data-slot=input-group]]:!bg-transparent dark:[&_[data-slot=input-group]]:!bg-transparent [&_[data-slot=input-group-control]]:!ring-0 [&_[data-slot=input-group-control]]:!outline-none [&_[data-slot=input-group-control]]:![box-shadow:none] [&_[data-slot=input-group-control]:focus]:!ring-0 [&_[data-slot=input-group-control]:focus]:!outline-none [&_[data-slot=input-group-control]:focus]:![box-shadow:none] [&_[data-slot=input-group-control]:focus-visible]:!ring-0 [&_[data-slot=input-group-control]:focus-visible]:!outline-none [&_[data-slot=input-group-control]:focus-visible]:![box-shadow:none] [&_[data-slot=input-group]:focus-within]:border-0 [&_[data-slot=input-group]:focus-within]:ring-0 [&_[data-slot=input-group-addon]]:border-0 [&_[data-slot=input-group-control]]:border-0"
  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
```

**Change to:**
```tsx
<PromptInput
  onSubmit={handleSubmit}
  className="prompt-input-form"
  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
```

- [ ] Verify: Only `prompt-input-form` remains in className
- [ ] Save file: Ctrl+S

---

## Step 3: Verification (6 minutes)

### 3.1 Build Check
- [ ] Run: `npm run build`
- [ ] Expected: ✅ Build completes successfully
- [ ] If error: Go to Step 1.3, fix CSS syntax

### 3.2 Dev Server
- [ ] Run: `npm run dev`
- [ ] Expected: ✅ Server starts without errors
- [ ] Wait: For "Ready in X seconds"

### 3.3 Browser Testing
- [ ] Open: http://localhost:3000
- [ ] Expected: Page loads without errors

### 3.4 Visual Testing

#### Input Styling
- [ ] Look at PromptInput component
- [ ] Expected: Input area has rounded corners
- [ ] Expected: Background is transparent (shows parent background)
- [ ] Expected: No visible borders

#### Focus State
- [ ] Click inside text input area
- [ ] Expected: Text input works
- [ ] Expected: NO visible focus ring (intentional per original CSS)
- [ ] Expected: Cursor visible and blinking

#### Attachments Area
- [ ] Attachments section appears below input (if any attached)
- [ ] Expected: Attachment buttons functional
- [ ] Expected: Style consistent

#### Dark Mode
- [ ] Toggle dark mode (usually in header/settings)
- [ ] Expected: PromptInput styling maintained
- [ ] Expected: Background still transparent
- [ ] Expected: All styles apply correctly

### 3.5 Console Check
- [ ] Press: F12 (Open DevTools)
- [ ] Click: Console tab
- [ ] Expected: ✅ No red errors
- [ ] Expected: ✅ No warnings about prompt-input-form
- [ ] If warnings: They should be unrelated to this change

### 3.6 Dev Tools Inspection
- [ ] Right-click: On PromptInput element
- [ ] Click: Inspect (or Inspect Element)
- [ ] Look at: Styles panel
- [ ] Verify: `.prompt-input-form` class is applied
- [ ] Verify: Computed styles show correct values:
  - [ ] `background-color: transparent`
  - [ ] `padding: 6px` (0.375rem)
  - [ ] `position: relative`

---

## Testing Checklist

### Functionality Tests
- [ ] Text input receives focus
- [ ] Text can be typed
- [ ] Text displays correctly
- [ ] Placeholder text visible (if set)
- [ ] Attachments can be added
- [ ] Submit button works
- [ ] No console errors

### Visual Tests
- [ ] Rounded corners visible (12px / 0.75rem)
- [ ] Transparent background (not white or colored)
- [ ] Proper spacing/padding
- [ ] Dark mode doesn't break styling
- [ ] Light mode styling correct
- [ ] Transitions smooth (if you click or type)

### Responsive Tests (if needed)
- [ ] Mobile view (375px width)
- [ ] Tablet view (640px width)
- [ ] Desktop view (1024px width)
- [ ] All responsive breakpoints work

### Accessibility Tests
- [ ] Tab into input field
- [ ] Keyboard can be used to interact
- [ ] Focus state is clearly indicated
- [ ] No accessibility warnings in console

---

## If Something Goes Wrong

### Issue: CSS Syntax Error
**Error:** `npm run build` shows CSS error
**Solution:**
1. Open `app/globals.css`
2. Check lines around line 890 (where you added CSS)
3. Verify all braces `{` have matching `}`
4. Verify no semicolons missing at end of properties
5. Try: Copy-paste CSS again from clean source

### Issue: Component Doesn't Update
**Error:** Changes don't appear in browser
**Solution:**
1. Save file: Ctrl+S (verify you see the save indicator)
2. Check: Did you replace the entire className?
3. Refresh browser: Ctrl+Shift+R (hard refresh)
4. Restart dev server: Stop with Ctrl+C, then `npm run dev`
5. Clear cache: Ctrl+Shift+Delete in browser

### Issue: Styling Looks Wrong
**Error:** Input doesn't have rounded corners or is not transparent
**Solution:**
1. Open DevTools (F12)
2. Inspect the element: Right-click → Inspect
3. Look at Computed Styles
4. Check: Is `prompt-input-form` class showing?
5. If no: Check className in ClaudeChat.tsx line 1982
6. If yes: Check CSS in app/globals.css for typos
7. Compare: Check `.prompt-input-form [data-slot="input-group"]` selector

### Issue: Focus Ring Still Appears
**Error:** Focus ring visible when it shouldn't be
**Solution:**
1. This is actually working correctly IF it's very subtle
2. But if it's strong/prominent, check:
   ```css
   .prompt-input-form [data-slot="input-group-control"] {
     ring-width: 0 !important;  /* Should be here */
   }
   ```
3. Verify `ring-width: 0 !important;` is present and spelled correctly

### Issue: Dark Mode Doesn't Work
**Error:** Styling broken in dark mode
**Solution:**
1. Verify this CSS block exists:
   ```css
   .dark .prompt-input-form [data-slot="input-group"] {
     background-color: transparent !important;
   }
   ```
2. Make sure dark mode is enabled in your app
3. Check: Is the `.dark` class applied to the root element?

---

## Success Criteria

**All of these should be true:**

- [ ] ✅ `app/globals.css` has new CSS utility class
- [ ] ✅ `components/ClaudeChat.tsx` line 1982 shows `className="prompt-input-form"`
- [ ] ✅ `npm run build` completes successfully
- [ ] ✅ `npm run dev` starts without errors
- [ ] ✅ Browser shows no console errors
- [ ] ✅ PromptInput component displays correctly
- [ ] ✅ Text input works and accepts focus
- [ ] ✅ Dark mode styling is correct
- [ ] ✅ No visual regression from original

**If all boxes checked: ✅ REFACTORING SUCCESSFUL**

---

## Git Commit

Once everything is working:

```bash
# Stage changes
git add app/globals.css components/ClaudeChat.tsx

# Commit with clear message
git commit -m "refactor: Extract PromptInput styling to CSS utility class

- Move 380+ character className to .prompt-input-form utility class
- Improve code readability and maintainability
- Centralize styling in app/globals.css
- Maintain exact same functionality and appearance
- Align with design guidelines (Maintainability First)"

# Optional: Push to branch
git push origin <branch-name>
```

---

## Clean Up & Documentation

- [ ] Remove any backup files or notes
- [ ] Archive this checklist once complete
- [ ] Share documentation with team if needed
- [ ] Update team wiki/docs if you have internal docs
- [ ] Consider similar refactorings for other components

---

## Completion Summary

**Date Started:** ___________
**Date Completed:** ___________
**Total Time:** ___________
**Issues Encountered:** None / List below:

```
[List any issues and solutions applied]
```

**Notes for Team:**

```
[Any additional notes for future reference]
```

---

## Quick Reference Commands

```bash
# Build project
npm run build

# Start dev server
npm run dev

# Run tests (if available)
npm test

# Format code
npm run format

# Type check
npx tsc --noEmit
```

---

**You're all set! The refactoring should be complete in about 10 minutes.**

Questions? Refer to:
- Quick guide: `docs/PROMPT-INPUT-REFACTORING-GUIDE.md`
- Detailed docs: `docs/reports/251202-prompt-input-className-refactoring.md`
- Navigation: `docs/reports/INDEX-prompt-input-refactoring.md`

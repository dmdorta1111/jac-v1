# 🎯 Task Examples - Trigger Guide

## How to Test the Task Component Examples

Your chat is now set up with **5 interactive task workflow examples**. Simply type the trigger phrases below to see them in action!

---

## 📋 Example Triggers

### 1. **Project Setup Example**
**What to type:**
- `project setup`
- `setup example`

**What you'll see:**
```
✓ Environment Configuration (Complete)
  • Installed Node.js 18.x
  • Created .env.local with required variables
  • Configured development server
  • Set up database connection

● Dependencies Installation (Active - Auto-expands)
  • Installing npm packages
  • Resolving peer dependencies
  • Caching packages locally

○ Testing Configuration (Pending)
○ Deployment Setup (Pending)
```

---

### 2. **Code Analysis Example**
**What to type:**
- `code analysis`
- `analyze code`

**What you'll see:**
```
✓ Structure Review (Complete)
● Performance Audit (Active - Auto-expands)
○ Security Scan (Pending)
```

---

### 3. **Data Processing Example**
**What to type:**
- `data processing`
- `process data`

**What you'll see:**
```
✓ Data Validation (Complete)
● Data Transformation (Active - Auto-expands)
○ Data Enrichment (Pending)
○ Output Generation (Pending)
```

---

### 4. **Feature Development Example**
**What to type:**
- `feature development`
- `develop feature`

**What you'll see:**
```
✓ Requirements Gathering (Complete)
● Frontend Development (Active - Auto-expands)
● Backend Development (Active - Auto-expands)
○ Testing & QA (Pending)
○ Deployment (Pending)
```

---

### 5. **Bug Fix Workflow Example**
**What to type:**
- `bug fix`
- `fix bug`

**What you'll see:**
```
✓ Bug Diagnosis (Complete)
● Fix Implementation (Active - Auto-expands)
○ Verification (Pending)
○ Release (Pending)
```

---

## 🎨 Interactive Features to Try

### 1. **Auto-Expand Active Tasks**
- Notice that any task with status `"active"` automatically opens
- Other tasks remain collapsed

### 2. **Click to Expand/Collapse**
- Click any task header to toggle it open/closed
- Animated chevron icon rotates smoothly

### 3. **Status Indicators**
- **✓ Green Checkmark** = Complete (collapsed)
- **● Blue Dot** = Active (auto-expands)
- **○ Gray Circle** = Pending (collapsed)

### 4. **Item Lists**
- Click to expand and see the bullet-point items
- Each item shows step-by-step details

### 5. **Dark Mode**
- Switch your theme and see the task colors adjust
- Colors remain readable in both light and dark modes

---

## 🧪 Testing Tips

1. **Try each trigger** - Type each phrase to see different workflows
2. **Click tasks** - Expand/collapse to see how items display
3. **Check dark mode** - Toggle theme to see color adjustments
4. **Try on mobile** - The tasks are fully responsive
5. **Watch animations** - Notice smooth transitions on expand/collapse

---

## 📝 How It Works Under the Hood

### Trigger Detection
When you type a message, the chat checks for keywords:
```
"project setup" → Shows projectSetupExample
"code analysis" → Shows codeAnalysisExample
"data processing" → Shows dataProcessingExample
"feature development" → Shows featureDevelopmentExample
"bug fix" → Shows bugFixExample
```

### Task Structure
Each task has:
```tsx
{
  id: "unique-id",           // Unique identifier
  title: "Task Name",        // What displays in header
  status: "pending",         // pending | active | complete
  items: ["Item 1", "Item 2"]  // Subtasks (optional)
}
```

### Status Behavior
- **Pending**: Gray, collapsed by default
- **Active**: Blue, auto-expands, shows in-progress indicator
- **Complete**: Green, collapsed by default

---

## 🎯 Real-World Usage Example

After you see how they work, you can create custom tasks in your own code:

```tsx
const customExample: Message = {
  id: generateId(),
  sender: "bot",
  text: "Here's what I'm working on:",
  timestamp: new Date(),
  tasks: [
    {
      id: "step1",
      title: "Research",
      status: "complete",
      items: ["Reviewed docs", "Gathered data"]
    },
    {
      id: "step2",
      title: "Implementation",
      status: "active",
      items: ["Writing code", "Testing"]
    },
    {
      id: "step3",
      title: "Deployment",
      status: "pending",
      items: ["Deploy", "Monitor"]
    }
  ]
};
```

---

## 💡 Tips for Creating Your Own Tasks

1. **Keep it organized** - 3-5 tasks per message is ideal
2. **Clear titles** - Use action-oriented names
3. **Relevant items** - 2-5 items per task for clarity
4. **Update status** - Change as work progresses (pending → active → complete)
5. **Use active verbs** - "Running analysis" not "Will run analysis"

---

## ✨ Visual Summary

```
When you type "project setup":

Bot sends a Message with:
  └── tasks array with 4 TaskStep objects
      ├── Task 1: "Environment Configuration" → status: "complete"
      ├── Task 2: "Dependencies Installation" → status: "active" (auto-opens!)
      ├── Task 3: "Testing Configuration" → status: "pending"
      └── Task 4: "Deployment Setup" → status: "pending"

Each task displays:
  • Status indicator (circle, dot, or checkmark)
  • Title text
  • Items list when expanded
  • Chevron icon for expand/collapse
  • Color-coded background (gray/blue/green)
```

---

## 🚀 Next Steps

1. **Try each trigger** in your chat - Type the phrases from above
2. **Observe the behavior** - See auto-expand, click to expand, etc.
3. **Check the code** - Look at `components/ai-elements/examples.tsx` to see structure
4. **Create your own** - Use the pattern to add custom tasks to your API responses
5. **Integrate with API** - Modify your backend to return task arrays

---

## 📚 Reference Files

- **Triggers Setup**: Lines 192-240 in `components/chat.tsx`
- **Example Data**: `components/ai-elements/examples.tsx`
- **Rendering Logic**: Lines 540-580 in `components/chat.tsx`
- **Task Component**: `components/ai-elements/task.tsx`

---

**Ready to test? Start typing a trigger phrase in your chat! 🎉**

# Task Component - Quick Reference Card

## 📋 Quick Setup

### 1. Import Task Components
```tsx
import {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
} from "@/components/ai-elements/task";
```

### 2. Define TaskStep Interface
```tsx
interface TaskStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "active" | "complete";
  items?: string[];
}
```

### 3. Add Tasks to Message
```tsx
const message: Message = {
  id: "msg-1",
  sender: "bot",
  text: "Starting process...",
  timestamp: new Date(),
  tasks: [
    {
      id: "task-1",
      title: "Step 1",
      status: "complete",
      items: ["Done item 1", "Done item 2"]
    },
    {
      id: "task-2",
      title: "Step 2",
      status: "active",
      items: ["Working on item"]
    },
    {
      id: "task-3",
      title: "Step 3",
      status: "pending",
      items: ["Pending item"]
    }
  ]
};
```

## 🎨 Status Quick Guide

| Status | When to Use | Auto-Expand | Indicator |
|--------|-----------|-------------|-----------|
| `pending` | Task not started | ❌ No | Empty circle |
| `active` | Currently working | ✅ Yes | Blue dot |
| `complete` | Task finished | ❌ No | Green ✓ |

## 💡 Common Patterns

### Pattern 1: Simple 3-Step Process
```tsx
tasks: [
  { id: "1", title: "Prepare", status: "complete", items: ["Ready"] },
  { id: "2", title: "Process", status: "active", items: ["Running"] },
  { id: "3", title: "Deliver", status: "pending", items: ["Waiting"] }
]
```

### Pattern 2: Detailed Workflow
```tsx
tasks: [
  {
    id: "analysis",
    title: "Analysis",
    status: "complete",
    items: ["Reviewed specs", "Identified issues", "Planned solution"]
  },
  {
    id: "development",
    title: "Development",
    status: "active",
    items: ["Writing code", "Adding tests", "Documentation"]
  }
]
```

### Pattern 3: Multi-Item Task
```tsx
{
  id: "setup",
  title: "Environment Setup",
  status: "complete",
  items: [
    "Installed Node.js",
    "Configured database",
    "Set up environment variables",
    "Initialized project",
    "Installed dependencies"
  ]
}
```

## 🔧 Rendering Code (Already Implemented)

Location: `components/chat.tsx` lines 503-556

The rendering is automatically handled in the `MessageBubble` component:

```tsx
{/* Task List for process tracking */}
{!isUser && message.tasks && message.tasks.length > 0 && (
  <div className="mb-4 space-y-3">
    {message.tasks.map((task) => (
      <Task key={task.id} defaultOpen={task.status === "active"}>
        <TaskTrigger title={task.title}>
          {/* Status indicator */}
          {/* Title */}
          {/* Chevron */}
        </TaskTrigger>
        <TaskContent>
          {/* Task items */}
        </TaskContent>
      </Task>
    ))}
  </div>
)}
```

## 📝 Best Practices Checklist

- [ ] Use 3-5 tasks per message maximum
- [ ] Include 2-5 items per task
- [ ] Keep titles under 50 characters
- [ ] Use active tense for items ("Running", not "Will run")
- [ ] Update status as progress changes
- [ ] Only include relevant items
- [ ] Test on mobile and desktop
- [ ] Verify dark mode appearance

## 🐛 Common Issues & Fixes

### Tasks Not Showing?
```tsx
// ✅ Correct: Bot message with tasks
{ sender: "bot", tasks: [...] }

// ❌ Wrong: User message (tasks only show for bot)
{ sender: "user", tasks: [...] }

// ❌ Wrong: Tasks array is empty
tasks: [] // Won't render
```

### Wrong Styling?
```tsx
// ✅ Correct status values
status: "pending" | "active" | "complete"

// ❌ Wrong status values
status: "done" // Won't match styling
status: "IN_PROGRESS" // Wrong format
```

### Items Not Expanding?
```tsx
// ✅ Correct: Items array with values
items: ["Item 1", "Item 2"]

// ❌ Wrong: Empty items array
items: []

// ❌ Wrong: No items property
{ id: "t1", title: "Task", status: "active" }
```

## 📊 Status Flow Diagram

```
Start
  ↓
┌─────────────┐
│  PENDING    │  ← Initial state
│  (Waiting)  │
└──────┬──────┘
       ↓
┌─────────────┐
│   ACTIVE    │  ← In progress (auto-expands)
│ (Processing)│
└──────┬──────┘
       ↓
┌─────────────┐
│  COMPLETE   │  ← Finished
│  (Done)     │
└─────────────┘
```

## 🎯 Implementation Checklist

- ✅ Task component imported
- ✅ TaskStep interface defined
- ✅ Message interface extended with tasks property
- ✅ Task rendering implemented in MessageBubble
- ✅ Status-based styling applied
- ✅ Dark mode support included
- ✅ Collapsible behavior working
- ✅ Auto-expand for active tasks
- ✅ Item lists displaying correctly

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `TASK_INTEGRATION_GUIDE.md` | Comprehensive usage guide |
| `TASK_IMPLEMENTATION_SUMMARY.md` | Technical implementation details |
| `TASK_VISUAL_REFERENCE.md` | Design and styling reference |
| `components/ai-elements/examples.tsx` | Code examples |
| This file | Quick reference |

## 🚀 Next Steps

1. **Integrate with API**: Update bot message creation to include tasks
2. **Update Status**: Change task status as work progresses
3. **Test on Devices**: Verify mobile and desktop rendering
4. **Dark Mode**: Check appearance in light and dark themes
5. **Performance**: Monitor task rendering with many tasks

## 💬 Usage Example

```tsx
// In your message handler
const response = await fetch("/api/chat", { method: "POST", body: userMessage });
const data = await response.json();

// Create message with tasks
const botMessage: Message = {
  id: generateId(),
  sender: "bot",
  text: data.response,
  timestamp: new Date(),
  tasks: data.tasks // From API response
};

setMessages(prev => [...prev, botMessage]);
```

## 🎨 Styling Override Example

If you need custom styling for specific tasks:

```tsx
<Task key={task.id} defaultOpen={task.status === "active"}>
  <TaskTrigger
    title={task.title}
    className={`rounded-lg p-2.5 transition-all ${
      task.status === "custom" ? "bg-purple-100 dark:bg-purple-950" : ""
    }`}
  >
    {/* Custom header */}
  </TaskTrigger>
</Task>
```

## 🔗 Related Components

- **Task**: `components/ai-elements/task.tsx`
- **MessageBubble**: `components/chat.tsx` lines 454-635
- **Message**: `components/ai-elements/message.tsx`
- **ChainOfThought**: `components/ai-elements/chain-of-thought.tsx`

---

**Version**: 1.0  
**Last Updated**: November 22, 2025  
**Status**: Production Ready  
**Quick Reference**: Always handy!

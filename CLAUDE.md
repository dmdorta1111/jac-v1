# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JAC (EMJAC AI Assistant) is a Next.js 16 full-stack application featuring an AI-powered chatbot with Claude integration and workflow visualization capabilities.

## Development Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16.0.3 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4.x with tailwindcss-animate
- **UI Components**: Radix UI primitives + shadcn/ui pattern
- **AI Integration**: @anthropic-ai/sdk (Claude API), model: claude-3-5-haiku-20241022
- **Workflow Visualization**: @xyflow/react (React Flow)
- **Animation**: Motion (Framer Motion)
- **Code Highlighting**: Shiki

## Architecture

```
app/
├── api/
│   ├── chat/route.js      # POST /api/chat - chat endpoint
│   └── claudeService.js   # Claude API integration (fetchClaudeResponse)
├── workflow/page.tsx      # Workflow visualization page
├── page.tsx               # Main chat interface
├── layout.tsx             # Root layout with ThemeProvider
└── globals.css            # Global styles and CSS variables

components/
├── chat.tsx               # Main chat component (complex, ~500 lines)
├── ai-elements/           # AI-specific components
│   ├── prompt-input.tsx   # Chat input with attachments (complex)
│   ├── message.tsx        # Message display
│   ├── chain-of-thought.tsx
│   ├── task.tsx           # Task/step visualization
│   ├── code-block.tsx     # Syntax-highlighted code
│   ├── reasoning.tsx      # AI reasoning display
│   └── [20+ other AI components]
├── ui/                    # Base UI components (shadcn/ui style)
├── workflow/              # Workflow-specific components
│   ├── workflow-node.tsx
│   └── workflow-edges.tsx
└── providers/
    └── theme-provider.tsx # Dark/light theme context

lib/
└── utils.ts               # Utility functions (cn class merging helper)
```

## Key Patterns

- **Client Components**: Use `"use client"` directive for components with hooks/interactivity
- **Class Merging**: Use `cn()` helper from `lib/utils.ts` for Tailwind class composition
- **Theme**: Dark/light mode via CSS variables and class-based switching
- **API Routes**: Next.js App Router convention - export async functions (POST, GET, etc.) from route.js files

## Environment Variables

Required in `.env.local`:
- `CLAUDE_API_KEY` - Anthropic API key for Claude

## AI Components Library

The `components/ai-elements/` directory contains a comprehensive set of pre-built AI chat components. Key components include:
- `prompt-input.tsx` - Rich input with file attachments
- `message.tsx` - Chat message rendering
- `task.tsx` - Multi-step task visualization
- `chain-of-thought.tsx` - Reasoning step display
- `code-block.tsx` - Syntax-highlighted code blocks
- `examples.tsx` - Example usage patterns




Reference `context/` folder for detailed best practices, guidelines documentation.
Reference `Markdown instructions/` folder for detailed component documentation.


## RULES

  -Full context of the work proposed MUST be outlined in the .claude/sessions/context_session.md file. Before delegating tasks to sub agents outline clearly the requirements of the task so they can get the full context. If the file does not exist then create one. After you finish the work, you must update the .claude/sessions/context_session.md file with the work you do. The other sub agents will do the research and propose a solution and you must execute it. Then they will check the work and update the .claude/sessions/context_session.md file with change request or complete ok. 

  ## Sub Agents

  You have 3 Sub agents to delegated work to. They all perform analysis and plan execution tasks. Anytime ui components are to be made you MUST outline the request in the .claude/sessions/context_session.md and delegate the research work to shadcn-ui-designer. Then the agent will update the .md file and you must follow the proposal by the agent to execute your work. You will be updating the code and implementing the proposed solutions after which you MUST update the .claude/sessions/context_session.md file with all the work you did. Then you will have the design-reviewer agent check your work for errors. When the design-reviewer agent is finish there will be updated instruction in .claude/sessions/context_session.md file to direct you further like fixing errors or completion. After each sub agent is finished the work make sure you read the related documentation they created to get full context of he plan before you start executing.
 
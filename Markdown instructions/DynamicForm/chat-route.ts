// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Load the skill file
async function loadFormBuilderSkill(): Promise<string> {
  try {
    const skillPath = join(process.cwd(), 'skills', 'DYNAMIC_FORM_BUILDER_SKILL.md');
    const skillContent = await readFile(skillPath, 'utf-8');
    return skillContent;
  } catch (error) {
    console.error('Failed to load skill file:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Load the dynamic form builder skill
    const formSkill = await loadFormBuilderSkill();

    // Build the system prompt with the skill
    const systemPrompt = `You are a helpful sales assistant that helps users quote and configure custom items. You have access to a special skill that allows you to generate dynamic forms.

${formSkill}

IMPORTANT INSTRUCTIONS:
1. When a user mentions they want to build, quote, or configure an item, immediately generate a form using the json-form code block format
2. Tailor the form fields to the specific item type they mentioned
3. Always use the exact JSON structure specified in the skill
4. Make sure to include helpful descriptions and appropriate validation
5. Group related fields into logical sections
6. After generating the form, provide a brief introduction explaining what information you need

Remember: You must output forms in a \`\`\`json-form code block for the frontend to properly render them.`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      content: content.text,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

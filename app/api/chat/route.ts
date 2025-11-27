import { NextResponse, NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Load the skill file
async function loadFormBuilderSkill(): Promise<string> {
  try {
    const skillPath = join(process.cwd(), 'skills', 'dynamic-form-builder.md');
    const skillContent = await readFile(skillPath, 'utf-8');
    return skillContent;
  } catch (error) {
    console.error('Failed to load skill file:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, messages } = await request.json();

    if (!prompt && (!messages || !Array.isArray(messages))) {
      return NextResponse.json(
        { error: 'Prompt or messages array is required' },
        { status: 400 }
      );
    }

    // Load the dynamic form builder skill
    const formSkill = await loadFormBuilderSkill();

    // Build the system prompt with the skill
    const systemPrompt = `You are JAC, a helpful engineering assistant for EMJAC that helps users with custom stainless steel fabrication projects, quotes, and specifications. You have access to a special skill that allows you to generate dynamic forms for collecting project specifications.

${formSkill}

IMPORTANT INSTRUCTIONS:
1. When a user mentions they want to build, quote, or configure a custom item (cabinet, sign, furniture, equipment, etc.), immediately generate a form using the json-form code block format
2. Tailor the form fields to the specific item type they mentioned
3. Always use the exact JSON structure specified in the skill
4. Make sure to include helpful descriptions and appropriate validation
5. Group related fields into logical sections
6. After generating the form, provide a brief introduction explaining what information you need

Remember: You must output forms in a \`\`\`json-form code block for the frontend to properly render them.

For regular conversation, respond helpfully about fabrication, engineering, and project specifications.`;

    // Use message history if provided, otherwise use single prompt
    const apiMessages = messages && messages.length > 0
      ? messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      : [{ role: 'user' as const, content: prompt }];

    // Call Claude API with system prompt and messages
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: apiMessages,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      response: content.text,
      usage: message.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get response from Claude',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

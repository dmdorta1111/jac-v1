import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client (server-side only)
// Support both CLAUDE_API_KEY (project standard) and ANTHROPIC_API_KEY (SDK standard)
const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.warn('Warning: No API key found. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in .env.local');
}

const anthropic = new Anthropic({
  apiKey: apiKey,
});

export interface ProjectData {
  projectId: string;
  clientName: string;
  projectType: string;
  requirements: string;
  budget?: string;
  timeline?: string;
  additionalNotes?: string;
}

export interface ProjectDocumentationRequest {
  projectData: ProjectData;
  action: 'initial_quote' | 'data_collection' | 'update' | 'final_summary';
  previousSteps?: string[];
}

export async function generateProjectDocumentation(
  request: ProjectDocumentationRequest
): Promise<string> {
  const prompt = buildPrompt(request);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response format from Claude');
}

function buildPrompt(request: ProjectDocumentationRequest): string {
  const { projectData, action, previousSteps } = request;

  let basePrompt = `You are a sales documentation assistant. Generate a detailed markdown document for the following project:

**Project ID:** ${projectData.projectId}
**Client Name:** ${projectData.clientName}
**Project Type:** ${projectData.projectType}
**Requirements:** ${projectData.requirements}
${projectData.budget ? `**Budget:** ${projectData.budget}` : ''}
${projectData.timeline ? `**Timeline:** ${projectData.timeline}` : ''}
${projectData.additionalNotes ? `**Additional Notes:** ${projectData.additionalNotes}` : ''}

`;

  if (previousSteps && previousSteps.length > 0) {
    basePrompt += `\n**Previous Steps:**\n${previousSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n`;
  }

  switch (action) {
    case 'initial_quote':
      basePrompt += `Generate an initial project documentation that includes:
1. Project Overview
2. Requirements Analysis
3. Preliminary Scope Assessment
4. Questions for Client
5. Next Steps for Sales Team
6. Timestamp and Status

Format the output as a well-structured markdown document.`;
      break;

    case 'data_collection':
      basePrompt += `Generate a data collection summary that includes:
1. Information Gathered
2. Outstanding Questions
3. Risk Assessment
4. Resource Requirements
5. Updated Timeline Estimate
6. Next Actions Required

Format the output as a well-structured markdown document.`;
      break;

    case 'update':
      basePrompt += `Generate an updated project documentation that includes:
1. Changes from Previous Version
2. Updated Requirements
3. Current Project Status
4. Blockers or Issues
5. Next Steps

Format the output as a well-structured markdown document.`;
      break;

    case 'final_summary':
      basePrompt += `Generate a final project summary that includes:
1. Complete Project Overview
2. All Requirements and Scope
3. Final Quote Breakdown
4. Timeline and Milestones
5. Terms and Conditions
6. Sign-off Section

Format the output as a well-structured markdown document suitable for client presentation.`;
      break;
  }

  return basePrompt;
}

export { anthropic };

export const SYSTEM_PROMPT = `You are an expert sales documentation assistant. Your role is to:
- Create clear, professional project documentation
- Extract key information from project requirements
- Identify gaps or risks in project specifications
- Provide actionable next steps for the sales team
- Maintain consistent formatting across all documents

Always structure your responses as markdown with clear headers, bullet points, and sections.`;

export function buildDetailedPrompt(
  projectData: Record<string, unknown>,
  context: string
): string {
  return `${SYSTEM_PROMPT}

Current Context: ${context}

Project Information:
${JSON.stringify(projectData, null, 2)}

Please generate a comprehensive markdown document following the requested format.`;
}

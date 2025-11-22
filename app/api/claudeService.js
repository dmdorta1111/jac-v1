
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export const fetchClaudeResponse = async (prompt) => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });
    return message.content[0].text;
  } catch (error) {
    console.error('Error fetching response from Claude AI:', error);
    throw error;
  }
};


// // Add response interceptor to capture network errors
// axios.interceptors.response.use(
//     // Pass through successful responses unchanged
//     (response) => response,

//     // Handle errors and send details to TrackJS
//     (error) => {
//         // Capture a formatted error with method and URL
//         if (error.config && error.config.method && error.config.url) {
//             TrackJS.track(`Network Error ${error.config.method.toUpperCase()}: ${error.config.url}`);
//         } else {
//             // Fallback for errors without config
//             TrackJS.track(error);
//         }

//         // Re-throw the error so other error handlers can process it
//         return Promise.reject(error);
//     }
// );
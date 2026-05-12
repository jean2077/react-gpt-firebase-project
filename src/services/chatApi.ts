import axios from 'axios';

const GPT_API_URL =
  import.meta.env.VITE_GPT_API_URL || 'https://callgptapi-bv7og3hfsa-uc.a.run.app';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export const requestChatReply = async (prompt: string): Promise<string> => {
  const response = await axios.post(
    GPT_API_URL,
    { prompt },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data = response.data as ChatCompletionResponse;
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error('GPT API response did not include a chat message.');
  }

  return reply;
};

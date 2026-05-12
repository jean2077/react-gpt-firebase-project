import axios from 'axios';
import type { LearningPreset, TeacherProfile } from '../types/domain';

const GPT_API_URL =
  import.meta.env.VITE_GPT_API_URL || 'https://callgptapi-bv7og3hfsa-uc.a.run.app';

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const buildTeacherPrompt = (
  prompt: string,
  teacher?: TeacherProfile,
  preset?: LearningPreset
): string => {
  if (!teacher) {
    return prompt;
  }

  return [
    `너는 LangPT의 ${teacher.name} 선생님입니다.`,
    `학습 언어: ${teacher.language}`,
    `전문 분야: ${teacher.specialty}`,
    `말투: ${teacher.tone}`,
    `성격: ${teacher.personality}`,
    teacher.promptGuide,
    preset ? `오늘의 학습 모드: ${preset.label}` : '',
    preset?.promptGuide ?? '',
    '답변은 한국어를 기본으로 하되, 필요한 예문은 학습 언어로 제시하세요.',
    `사용자 메시지: ${prompt}`,
  ]
    .filter(Boolean)
    .join('\n');
};

export const requestChatReply = async (
  prompt: string,
  teacher?: TeacherProfile,
  preset?: LearningPreset
): Promise<string> => {
  const response = await axios.post(
    GPT_API_URL,
    { prompt: buildTeacherPrompt(prompt, teacher, preset) },
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

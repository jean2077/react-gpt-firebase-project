import type { LearningPreset } from '../types/domain';

export const learningPresets: LearningPreset[] = [
  {
    id: 'conversation',
    label: '회화 집중',
    description: '짧은 질문과 역할극으로 말문을 여는 모드',
    promptGuide:
      '회화 연습 중심으로 답변하고, 사용자가 바로 이어 말할 수 있는 짧은 질문을 마지막에 하나 덧붙여주세요.',
  },
  {
    id: 'grammar',
    label: '문법 집중',
    description: '문장 구조와 어순을 차분히 잡아주는 모드',
    promptGuide:
      '문법과 어순을 중심으로 틀린 부분을 짚고, 쉬운 예문 1개와 바로 바꿔 말할 문장 1개를 제안해주세요.',
  },
  {
    id: 'correction',
    label: '문장 첨삭',
    description: '원문, 수정문, 이유, 다시 말하기로 정리',
    promptGuide:
      '반드시 원문 / 수정문 / 이유 / 다시 말하기 형식으로 답변하고, 사용자의 문장을 자연스럽게 첨삭해주세요.',
  },
  {
    id: 'exam',
    label: '시험 대비',
    description: 'HSK, JLPT, 표현 암기처럼 핵심을 압축',
    promptGuide:
      '시험 대비 관점에서 핵심 표현, 오답 포인트, 짧은 확인 문제를 포함해 답변해주세요.',
  },
  {
    id: 'business',
    label: '비즈니스',
    description: '회의, 메일, 발표 표현을 실무 톤으로 정리',
    promptGuide:
      '비즈니스 상황에 맞는 정중한 표현으로 다듬고, 더 자연스러운 대체 문장 2개를 제안해주세요.',
  },
];

export const DEFAULT_LEARNING_PRESET = learningPresets[0];

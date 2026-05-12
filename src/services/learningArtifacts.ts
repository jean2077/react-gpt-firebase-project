import type {
  DailyLearningGoals,
  LearningEvent,
  LearningEventType,
  LearningLanguage,
  LevelTestResult,
  SavedExpression,
} from '../types/domain';

const EXPRESSIONS_KEY = 'langpt.savedExpressions';
const EVENTS_KEY = 'langpt.learningEvents';
const GOALS_KEY = 'langpt.dailyGoals';
const LEVEL_RESULT_KEY = 'langpt.levelTestResult';
export const LEARNING_ARTIFACTS_EVENT = 'langpt-learning-artifacts-change';

export const DEFAULT_DAILY_GOALS: DailyLearningGoals = {
  sentenceGoal: 5,
  quizGoal: 3,
  expressionGoal: 3,
};

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readJson = <T,>(key: string, fallbackValue: T): T => {
  if (!canUseStorage()) {
    return fallbackValue;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallbackValue;
  } catch {
    return fallbackValue;
  }
};

const writeJson = <T,>(key: string, value: T): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(LEARNING_ARTIFACTS_EVENT));
};

const createId = (prefix: string) => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const isSameDay = (value: string, date = new Date()) => {
  const target = new Date(value);
  return target.toDateString() === date.toDateString();
};

export const getSavedExpressions = (): SavedExpression[] =>
  readJson<SavedExpression[]>(EXPRESSIONS_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

export const saveExpression = (input: {
  text: string;
  note?: string;
  language: LearningLanguage;
  teacherName: string;
  source: SavedExpression['source'];
}): SavedExpression => {
  const expression: SavedExpression = {
    id: createId('expression'),
    text: input.text.trim(),
    note: input.note?.trim() ?? '',
    language: input.language,
    teacherName: input.teacherName,
    source: input.source,
    createdAt: new Date().toISOString(),
    reviewCount: 0,
  };

  writeJson(EXPRESSIONS_KEY, [expression, ...getSavedExpressions()]);
  recordLearningEvent({
    type: 'expression',
    title: '표현 저장',
    description: expression.text,
  });

  return expression;
};

export const deleteExpression = (expressionId: string): void => {
  writeJson(
    EXPRESSIONS_KEY,
    getSavedExpressions().filter((expression) => expression.id !== expressionId)
  );
};

export const reviewExpression = (expressionId: string): void => {
  writeJson(
    EXPRESSIONS_KEY,
    getSavedExpressions().map((expression) =>
      expression.id === expressionId
        ? {
            ...expression,
            reviewCount: expression.reviewCount + 1,
            lastReviewedAt: new Date().toISOString(),
          }
        : expression
    )
  );
};

export const getLearningEvents = (): LearningEvent[] =>
  readJson<LearningEvent[]>(EVENTS_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

export const recordLearningEvent = (input: {
  type: LearningEventType;
  title: string;
  description: string;
}): LearningEvent => {
  const event: LearningEvent = {
    id: createId('event'),
    type: input.type,
    title: input.title,
    description: input.description,
    createdAt: new Date().toISOString(),
  };

  writeJson(EVENTS_KEY, [event, ...getLearningEvents()].slice(0, 80));
  return event;
};

export const getTodayLearningEvents = (): LearningEvent[] =>
  getLearningEvents().filter((event) => isSameDay(event.createdAt));

export const getDailyGoals = (): DailyLearningGoals =>
  readJson<DailyLearningGoals>(GOALS_KEY, DEFAULT_DAILY_GOALS);

export const saveDailyGoals = (goals: DailyLearningGoals): void => {
  writeJson(GOALS_KEY, {
    sentenceGoal: Math.max(1, Math.round(goals.sentenceGoal)),
    quizGoal: Math.max(1, Math.round(goals.quizGoal)),
    expressionGoal: Math.max(1, Math.round(goals.expressionGoal)),
  });
};

export const getTodayGoalProgress = () => {
  const events = getTodayLearningEvents();

  return {
    sentenceCount: events.filter((event) => event.type === 'chat').length,
    quizCount: events.filter((event) => event.type === 'quiz').length,
    expressionCount: events.filter((event) => event.type === 'expression').length,
  };
};

export const getLevelTestResult = (): LevelTestResult | null =>
  readJson<LevelTestResult | null>(LEVEL_RESULT_KEY, null);

export const saveLevelTestResult = (result: LevelTestResult): void => {
  writeJson(LEVEL_RESULT_KEY, result);
  recordLearningEvent({
    type: 'level',
    title: '레벨 테스트 완료',
    description: `${result.total}문제 중 ${result.score}문제 정답`,
  });
};

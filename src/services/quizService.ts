import type { Quiz } from '../types/domain';
import { localChineseQuizzes } from '../data/localQuizzes';

export const fetchChineseQuizzes = async (): Promise<Quiz[]> => {
  return localChineseQuizzes;
};

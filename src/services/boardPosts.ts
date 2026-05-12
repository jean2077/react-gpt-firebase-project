import type { BoardPost, BoardPostCategory } from '../types/domain';

const BOARD_POSTS_STORAGE_KEY = 'langpt.languageBoardPosts';

const seedPosts: BoardPost[] = [
  {
    id: 'seed-board-1',
    title: '회의에서 바로 쓰는 영어 표현',
    content:
      'Could you clarify that point? 는 회의에서 상대방에게 다시 설명을 부탁할 때 자연스럽게 쓸 수 있어요.',
    author: '엠마',
    category: 'english',
    createdAt: '2026-05-12T00:00:00.000Z',
    viewCount: 12,
  },
  {
    id: 'seed-board-2',
    title: '把자문 연습 문장 모음',
    content:
      '我把作业做完了, 我把房间打扫干净了 처럼 동작의 결과가 드러나는 문장을 연습해보면 좋아요.',
    author: '메이린',
    category: 'chinese',
    createdAt: '2026-05-12T00:15:00.000Z',
    viewCount: 8,
  },
  {
    id: 'seed-board-3',
    title: '카페에서 주문할 때 쓰는 일본어',
    content:
      'ホットコーヒーを一つください. 처럼 원하는 메뉴 뒤에 を一つください를 붙이면 자연스럽게 주문할 수 있어요.',
    author: '유나',
    category: 'japanese',
    createdAt: '2026-05-12T00:30:00.000Z',
    viewCount: 5,
  },
];

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const createPostId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `board-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const readStoredPosts = (): BoardPost[] => {
  if (!canUseStorage()) {
    return seedPosts;
  }

  try {
    const value = window.localStorage.getItem(BOARD_POSTS_STORAGE_KEY);
    return value ? (JSON.parse(value) as BoardPost[]) : seedPosts;
  } catch {
    return seedPosts;
  }
};

const savePosts = (posts: BoardPost[]) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(BOARD_POSTS_STORAGE_KEY, JSON.stringify(posts));
};

export const getBoardPosts = (): BoardPost[] =>
  [...readStoredPosts()].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

interface CreateBoardPostInput {
  title: string;
  content: string;
  author: string;
  category: BoardPostCategory;
}

export const createBoardPost = ({
  title,
  content,
  author,
  category,
}: CreateBoardPostInput): BoardPost => {
  const post: BoardPost = {
    id: createPostId(),
    title: title.trim(),
    content: content.trim(),
    author: author.trim() || '게스트',
    category,
    createdAt: new Date().toISOString(),
    viewCount: 0,
  };

  savePosts([post, ...readStoredPosts()]);
  return post;
};

export const increaseBoardPostView = (postId: string): BoardPost | null => {
  const posts = readStoredPosts();
  const postIndex = posts.findIndex((post) => post.id === postId);

  if (postIndex < 0) {
    return null;
  }

  posts[postIndex] = {
    ...posts[postIndex],
    viewCount: posts[postIndex].viewCount + 1,
  };
  savePosts(posts);
  return posts[postIndex];
};

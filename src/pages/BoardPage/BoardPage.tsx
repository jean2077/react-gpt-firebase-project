import React, { useMemo, useState } from 'react';
import { createBoardPost, getBoardPosts, increaseBoardPostView } from '../../services/boardPosts';
import { getCurrentUser } from '../../services/localAuth';
import type { BoardPost, BoardPostCategory } from '../../types/domain';
import './BoardPage.css';

const categoryLabels: Record<BoardPostCategory, string> = {
  english: '영어',
  chinese: '중국어',
  japanese: '일본어',
};

const categoryOptions = Object.entries(categoryLabels) as Array<[BoardPostCategory, string]>;

const formatPostDate = (value: string) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

function BoardPage() {
  const [posts, setPosts] = useState<BoardPost[]>(() => getBoardPosts());
  const [selectedPostId, setSelectedPostId] = useState(() => posts[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BoardPostCategory>('english');
  const [activeCategory, setActiveCategory] = useState<BoardPostCategory | 'all'>('all');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredPosts = useMemo(
    () =>
      activeCategory === 'all'
        ? posts
        : posts.filter((post) => post.category === activeCategory),
    [activeCategory, posts]
  );

  const selectedPost = useMemo(
    () =>
      filteredPosts.find((post) => post.id === selectedPostId) ??
      filteredPosts[0] ??
      posts[0],
    [filteredPosts, posts, selectedPostId]
  );

  const postCountByCategory = useMemo(
    () =>
      posts.reduce<Record<BoardPostCategory, number>>(
        (counts, post) => ({
          ...counts,
          [post.category]: counts[post.category] + 1,
        }),
        { english: 0, chinese: 0, japanese: 0 }
      ),
    [posts]
  );

  const handleCategoryFilter = (nextCategory: BoardPostCategory | 'all') => {
    setActiveCategory(nextCategory);
    const nextPosts =
      nextCategory === 'all'
        ? posts
        : posts.filter((post) => post.category === nextCategory);
    setSelectedPostId(nextPosts[0]?.id ?? '');
  };

  const handleSelectPost = (postId: string) => {
    const updatedPost = increaseBoardPostView(postId);
    if (!updatedPost) {
      return;
    }

    setSelectedPostId(postId);
    setPosts(getBoardPosts());
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !content.trim()) {
      setErrorMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const currentUser = getCurrentUser();
    const newPost = createBoardPost({
      title,
      content,
      category,
      author: currentUser?.nickname ?? '게스트',
    });

    setPosts(getBoardPosts());
    setSelectedPostId(newPost.id);
    setActiveCategory(category);
    setTitle('');
    setContent('');
    setCategory('english');
  };

  return (
    <main className="board-page">
      <section className="board-hero">
        <div>
          <p className="eyebrow">Language board</p>
          <h1>언어별로 모아보는 학습 게시판</h1>
        </div>
        <p>
          영어, 중국어, 일본어 표현과 질문을 언어별로 정리하세요. 배운 문장은 다시 찾기 쉬워야
          오래 남습니다.
        </p>
      </section>

      <section className="board-summary" aria-label="게시판 요약">
        {categoryOptions.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`board-summary__item board-summary__item--${key}${
              activeCategory === key ? ' board-summary__item--active' : ''
            }`}
            onClick={() => handleCategoryFilter(key)}
          >
            <span>{label} 게시판</span>
            <strong>{postCountByCategory[key]}</strong>
          </button>
        ))}
      </section>

      <section className="board-layout">
        <div className="board-list" aria-label="게시글 목록">
          <div className="board-list__header">
            <div>
              <h2>{activeCategory === 'all' ? '전체 글' : `${categoryLabels[activeCategory]} 글`}</h2>
              <span>{filteredPosts.length}개</span>
            </div>
            <button
              type="button"
              className={activeCategory === 'all' ? 'board-filter--active' : ''}
              onClick={() => handleCategoryFilter('all')}
            >
              전체
            </button>
          </div>

          {filteredPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              className={`board-post-item${
                post.id === selectedPost?.id ? ' board-post-item--active' : ''
              }`}
              onClick={() => handleSelectPost(post.id)}
            >
              <span className={`board-post-item__tag board-post-item__tag--${post.category}`}>
                {categoryLabels[post.category]}
              </span>
              <strong>{post.title}</strong>
              <span className="board-post-item__meta">
                {post.author} · {formatPostDate(post.createdAt)} · 조회 {post.viewCount}
              </span>
            </button>
          ))}
          {filteredPosts.length === 0 && (
            <p className="board-empty board-empty--list">아직 이 언어의 글이 없습니다.</p>
          )}
        </div>

        <article className="board-detail" aria-label="선택한 게시글">
          {selectedPost ? (
            <>
              <span className={`board-detail__tag board-detail__tag--${selectedPost.category}`}>
                {categoryLabels[selectedPost.category]}
              </span>
              <h2>{selectedPost.title}</h2>
              <div className="board-detail__meta">
                <span>{selectedPost.author}</span>
                <span>{formatPostDate(selectedPost.createdAt)}</span>
                <span>조회 {selectedPost.viewCount}</span>
              </div>
              <p>{selectedPost.content}</p>
            </>
          ) : (
            <p className="board-empty">아직 게시글이 없습니다.</p>
          )}
        </article>

        <form className="board-form" onSubmit={handleSubmit}>
          <h2>글쓰기</h2>
          <label>
            언어
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as BoardPostCategory)}
            >
              {categoryOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            제목
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 회의에서 쓸 영어 표현"
            />
          </label>
          <label>
            내용
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="배운 표현, 헷갈린 문장, 질문을 적어주세요"
              rows={7}
            />
          </label>
          {errorMessage && <p className="board-form__error">{errorMessage}</p>}
          <button type="submit">게시하기</button>
        </form>
      </section>
    </main>
  );
}

export default BoardPage;

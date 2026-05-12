import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import App from './App';

vi.mock('axios', () => ({
  post: vi.fn(),
}));

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, '', '/');
});

test('renders main page call to action', () => {
  render(<App />);
  const linkElement = screen.getByText(/무료로 이용해보세요/i);
  expect(linkElement).toBeInTheDocument();
});

test('logs in with one click and stores a local demo session', async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole('link', { name: /무료로 이용해보세요/ }));
  await user.click(await screen.findByRole('button', { name: '로그인' }));

  await waitFor(() => {
    expect(window.location.pathname).toBe('/chat');
  });

  const session = JSON.parse(
    window.localStorage.getItem('langpt.localAuth.session') ?? 'null'
  ) as { user: { nickname: string } } | null;
  expect(session?.user.nickname).toBe('데모 사용자');
  expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
});

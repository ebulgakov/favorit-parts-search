import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { createStore } from './store';
import { byNumberMeyle, notFound, withAnaloguesMeyle } from './api/__fixtures__/responses';

const reply = (body) => Promise.resolve({ ok: true, status: 200, json: async () => body });

function renderApp() {
  render(
    <Provider store={createStore()}>
      <App />
    </Provider>,
  );
  return userEvent.setup();
}

describe('Подбор запчастей', () => {
  it('ищет производителей, а по выбранному бренду показывает предложения и аналоги', async () => {
    const fetchMock = vi.fn((url) =>
      reply(url.includes('analogues=on') ? withAnaloguesMeyle : byNumberMeyle),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = renderApp();

    await user.type(screen.getByLabelText('Артикул детали'), '7160500039S{Enter}');
    await user.click(await screen.findByRole('button', { name: /MEYLE/ }));

    const table = await screen.findByRole('table');
    expect(within(table).getByText('Hapco')).toBeInTheDocument();
    expect(within(table).getByText(/12\s533,62/)).toBeInTheDocument();
    expect(within(table).getByText('Нет в наличии')).toBeInTheDocument();

    const lastUrl = new URL(fetchMock.mock.calls.at(-1)[0], 'http://localhost');
    expect(lastUrl.searchParams.get('number')).toBe('7160500039S');
    expect(lastUrl.searchParams.get('brand')).toBe('MEYLE');
  });

  it('сообщает, что по артикулу ничего не нашлось', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(notFound)));
    const user = renderApp();

    await user.type(screen.getByLabelText('Артикул детали'), '000000{Enter}');

    expect(await screen.findByText(/ничего не нашлось/)).toBeInTheDocument();
  });

  it('при сбое сети показывает ошибку и даёт повторить запрос', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockImplementation(() => reply(byNumberMeyle));
    vi.stubGlobal('fetch', fetchMock);
    const user = renderApp();

    await user.type(screen.getByLabelText('Артикул детали'), '7160500039S{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Нет связи с сервером');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(await screen.findByRole('button', { name: /MEYLE/ })).toBeInTheDocument();
  });
});

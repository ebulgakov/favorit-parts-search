// Демо-режим: отвечает примерами из документации с небольшой задержкой,
// чтобы были видны лоадеры. Включается переменной VITE_USE_MOCKS=true.
import {
  byNumber0189,
  byNumberMeyle,
  emptyKeyError,
  notFound,
  withAnaloguesMeyle,
} from './__fixtures__/responses';

const DELAY_MS = 500;
const clean = (value) => (value ?? '').replace(/[^0-9a-zа-я]/gi, '').toUpperCase();

function pickResponse(params) {
  if (!params.get('key')) return emptyKeyError;
  const number = clean(params.get('number'));
  const brand = params.get('brand');
  const analogues = params.get('analogues') === 'on';

  if (number === '7160500039S') {
    return brand && analogues ? withAnaloguesMeyle : byNumberMeyle;
  }
  if (number === '0189') {
    if (!brand) return byNumber0189;
    const goods = byNumber0189.goods.filter((good) => good.brand === brand);
    return goods.length ? { goods } : notFound;
  }
  return notFound;
}

export function mockFetch(url, { signal } = {}) {
  const params = new URL(url, 'http://localhost').searchParams;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const body = pickResponse(params);
      resolve({ ok: true, status: 200, json: async () => body });
    }, DELAY_MS);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

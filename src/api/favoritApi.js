import { ApiError, toBrands, toProducts, unwrapGoods } from './normalize';
import { mockFetch } from './mock';

const BASE_URL = '/api/hsprice/';
const API_KEY = import.meta.env.VITE_API_KEY || '00000000-0000-0000-0000-000000000001';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

async function request(params, signal) {
  // URLSearchParams сам экранирует спецсимволы в номере и бренде (#, &, /)
  const query = new URLSearchParams({ key: API_KEY, info: 'on', ...params });
  const doFetch = USE_MOCKS ? mockFetch : fetch;

  let response;
  try {
    response = await doFetch(`${BASE_URL}?${query}`, { signal });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Нет связи с сервером. Проверьте подключение к интернету');
  }

  if (!response.ok) {
    throw new ApiError(`Сервер ответил ошибкой ${response.status}`);
  }

  let json;
  try {
    json = await response.json();
  } catch {
    throw new ApiError('Сервер вернул некорректный ответ');
  }
  return unwrapGoods(json);
}

export async function searchBrands(number, signal) {
  return toBrands(await request({ number }, signal));
}

export async function searchOffers({ number, brand }, signal) {
  return toProducts(await request({ number, brand, analogues: 'on' }, signal));
}

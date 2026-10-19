import { describe, expect, it } from 'vitest';
import reducer, { fetchBrands } from './searchSlice';

const pending = (requestId, arg) => fetchBrands.pending(requestId, arg);
const fulfilled = (requestId, arg, payload) => fetchBrands.fulfilled(payload, requestId, arg);

describe('searchSlice', () => {
  it('игнорирует ответ на устаревший запрос, если пришёл после свежего', () => {
    let state = reducer(undefined, pending('old', '0189'));
    state = reducer(state, pending('new', '7160500039S'));
    state = reducer(state, fulfilled('new', '7160500039S', [{ brand: 'MEYLE' }]));
    state = reducer(state, fulfilled('old', '0189', [{ brand: 'ZEN' }]));

    expect(state.query).toBe('7160500039S');
    expect(state.brands.items).toEqual([{ brand: 'MEYLE' }]);
  });

  it('новый поиск сбрасывает выбранный бренд и предложения', () => {
    const selected = {
      ...reducer(undefined, { type: 'init' }),
      selectedBrand: 'MEYLE',
      offers: { status: 'succeeded', items: [{ id: 1 }], error: null, requestId: 'x' },
    };
    const state = reducer(selected, pending('id', '0189'));

    expect(state.selectedBrand).toBeNull();
    expect(state.offers.items).toEqual([]);
  });
});

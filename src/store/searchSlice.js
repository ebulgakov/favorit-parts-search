import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { searchBrands, searchOffers } from '../api/favoritApi';

const request = () => ({ status: 'idle', items: [], error: null, requestId: null });

const initialState = {
  query: '',
  selectedBrand: null,
  brands: request(),
  offers: request(),
};

export const fetchBrands = createAsyncThunk('search/fetchBrands', (number, { signal }) =>
  searchBrands(number, signal),
);

export const fetchOffers = createAsyncThunk('search/fetchOffers', (brand, { getState, signal }) =>
  searchOffers({ number: getState().search.query, brand }, signal),
);

// Общая обработка трёх стадий запроса. Ответ принимаем, только если он от
// последнего запроса: так старый медленный ответ не перетрёт свежий.
function track(builder, thunk, field, onPending) {
  builder
    .addCase(thunk.pending, (state, action) => {
      onPending?.(state, action);
      state[field] = { ...request(), status: 'loading', requestId: action.meta.requestId };
    })
    .addCase(thunk.fulfilled, (state, action) => {
      if (state[field].requestId !== action.meta.requestId) return;
      state[field].status = 'succeeded';
      state[field].items = action.payload;
    })
    .addCase(thunk.rejected, (state, action) => {
      if (state[field].requestId !== action.meta.requestId || action.meta.aborted) return;
      state[field].status = 'failed';
      state[field].error = action.error.message || 'Что-то пошло не так';
    });
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchCleared: () => initialState,
  },
  extraReducers: (builder) => {
    track(builder, fetchBrands, 'brands', (state, action) => {
      state.query = action.meta.arg;
      state.selectedBrand = null;
      state.offers = request();
    });
    track(builder, fetchOffers, 'offers', (state, action) => {
      state.selectedBrand = action.meta.arg;
    });
  },
});

export const { searchCleared } = searchSlice.actions;
export default searchSlice.reducer;

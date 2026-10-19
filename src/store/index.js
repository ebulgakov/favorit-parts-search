import { configureStore } from '@reduxjs/toolkit';
import search from './searchSlice';

export const createStore = (preloadedState) =>
  configureStore({ reducer: { search }, preloadedState });

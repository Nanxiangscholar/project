import { configureStore } from '@reduxjs/toolkit';
import appReducer from './modules/app';
import booksReducer from './booksSlice.js';

const store = configureStore({
  reducer: {
    app: appReducer,
    books: booksReducer,
  },
});

export default store;
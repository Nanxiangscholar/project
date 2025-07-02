import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    keyStrategy: 'id',
  },
  reducers: {
    updateKeyStrategy: (state, action) => {
      state.keyStrategy = action.payload;
    },
  },
});

export const { updateKeyStrategy } = appSlice.actions;

export const selectKeyStrategy = (state) => state.app.keyStrategy;

export default appSlice.reducer;
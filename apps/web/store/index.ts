import { configureStore } from '@reduxjs/toolkit'
import { inventorySlice } from './slices/inventorySlice'

export const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

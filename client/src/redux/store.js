import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import orebiReducer from "./orebiSlice";

const persistConfig = {
  key: "root",
  version: 2, // 🔥 ĐÃ SỬA: Tăng version lên 2 để reset cache cũ bị lỗi
  storage,
};

const persistedReducer = persistReducer(persistConfig, orebiReducer);

export const store = configureStore({
  reducer: { orebiReducer: persistedReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);
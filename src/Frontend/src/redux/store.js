import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './features/authSlice'

const persistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user','isAuthenticated', 'isMaker', 'isChecker'] // Only auth will be persisted
  }
  
  const persistedReducer = persistReducer(persistConfig, authReducer)
  
  export const store = configureStore({
    reducer: {
      auth: persistedReducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false // Disable serializable check for redux-persist
      })
  })
  
  export const persistor = persistStore(store)
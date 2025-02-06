import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../components/services/api'

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
      try {
        const response = await api.post('/user/logout/')
        return response.data
      } catch (error) {
        return rejectWithValue(error.response?.data || 'Logout failed')
      }
    }
  )

const initialState = {
  user: null,
  isAuthenticated: false,
  isMaker: false,
  isChecker: false,
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.isMaker = action.payload.user.is_maker
      state.isChecker = action.payload.user.is_checker
      state.error = null
    },
    loginFailure: (state, action) => {
      state.loading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        // Reset to initial state
        return initialState
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { loginStart, loginSuccess, loginFailure } = authSlice.actions
export default authSlice.reducer
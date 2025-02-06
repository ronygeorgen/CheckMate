import { useState } from 'react';
import api from '../services/api';
import { useDispatch } from 'react-redux'
import { loginStart, loginSuccess, loginFailure } from '../../redux/features/authSlice'

export const useLogin = () => {

  const dispatch = useDispatch()
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    isSuccess: false
  });

  const login = async (credentials) => {

    dispatch(loginStart())
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post('/user/login/', credentials);

      dispatch(loginSuccess({
        user: {
          ...response.data.user,
          is_maker: response.data.user.is_maker,
          is_checker: response.data.user.is_checker
        },
        token: response.data.token
      }))

      
      setState({
        isLoading: false,
        error: null,
        isSuccess: true
      });

      return {
        is_maker: response.data.user.is_maker,
        is_checker: response.data.user.is_checker
      };
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.response?.data?.detail ||
        'Login failed. Please check your credentials.';

      dispatch(loginFailure(errorMessage))
      setState({
        isLoading: false,
        error: errorMessage,
        isSuccess: false
      });

      throw new Error(errorMessage);
    }
  };

  return {
    login,
    state
  };
};
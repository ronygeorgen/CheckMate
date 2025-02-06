import { useState } from 'react';
import api from '../services/api';

export const useRegistration = () => {
  const [state, setState] = useState({
    isLoading: false,
    error: null,
    isSuccess: false
  });

  const registerUser = async (userData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post('/user/register/', userData);
      
      setState({
        isLoading: false,
        error: null,
        isSuccess: true
      });

      return response.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      setState({
        isLoading: false,
        error: errorMessage,
        isSuccess: false
      });

      throw new Error(errorMessage);
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false
    });
  };

  return {
    registerUser,
    state,
    resetState
  };
};
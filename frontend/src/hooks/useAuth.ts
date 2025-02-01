import { useState, useCallback } from 'react';
import { authService } from '../services/auth';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      return response;
    } catch (err) {
      setError('فشل تسجيل الدخول');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.signup(name, email, password);
      localStorage.setItem('token', response.token);
      return response;
    } catch (err) {
      setError('فشل التسجيل');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    login,
    signup,
    isLoading,
    error
  };
}; 
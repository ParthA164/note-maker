import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import AuthService from '../../services/auth';
import GoogleAuthService from '../../services/googleAuth';
import { LoginData } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required')
});

const LoginForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    // Initialize Google OAuth button
    const initGoogleAuth = async () => {
      if (googleButtonRef.current) {
        try {
          await GoogleAuthService.renderButton(googleButtonRef.current, handleGoogleAuth);
        } catch (error) {
          console.error('Failed to initialize Google Auth:', error);
        }
      }
    };

    initGoogleAuth();
  }, []);

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await AuthService.login(data);

      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (errorMessage.includes('verify your email')) {
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (credentialToken: string) => {
    try {
      setIsGoogleLoading(true);
      setError('');

      const response = await AuthService.googleAuth(credentialToken);
      
      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        toast.success('Google login successful!');
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {error && <Alert type="error" message={error} />}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-5">
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />

              <Input
                {...register('password')}
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>



            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
            >
              Sign In
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Google Auth Button */}
            <div className="w-full">
              <div ref={googleButtonRef} className="w-full" />
              {/* Development Fallback Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-300 mt-2"
                size="lg"
                loading={isGoogleLoading}
                onClick={async () => {
                  try {
                    setIsGoogleLoading(true);
                    // Simulate Google OAuth for development
                    const mockGoogleToken = "mock_google_token_for_development";
                    await handleGoogleAuth(mockGoogleToken);
                  } catch (error) {
                    console.error('Dev Google Auth failed:', error);
                    toast.error('Google OAuth needs to be configured for localhost. Please use email/password login for now.');
                  } finally {
                    setIsGoogleLoading(false);
                  }
                }}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google (Dev)
              </Button>
              {isGoogleLoading && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Signing in with Google...</span>
                </div>
              )}
            </div>
          </form>
          
          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
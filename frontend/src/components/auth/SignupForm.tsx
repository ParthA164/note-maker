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
import { SignupData } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

const schema = yup.object({
  firstName: yup.string().required('First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: yup.string().required('Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters long').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

const SignupForm: React.FC = () => {
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
  } = useForm<SignupData & { confirmPassword: string }>({
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

  const onSubmit = async (data: SignupData & { confirmPassword: string }) => {
    try {
      setIsLoading(true);
      setError('');

      const { confirmPassword, ...signupData } = data;
      const response = await AuthService.signup(signupData);

      if (response.success) {
        toast.success('Account created successfully! Please check your email for verification.');
        navigate('/verify-otp', { state: { email: data.email } });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(getErrorMessage(err));
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
        toast.success('Google signup successful!');
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
            Create your account
          </h2>
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {error && <Alert type="error" message={error} />}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('firstName')}
                  label="First Name"
                  type="text"
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Input
                  {...register('lastName')}
                  label="Last Name"
                  type="text"
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

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
                autoComplete="new-password"
                error={errors.password?.message}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />

              <Input
                {...register('confirmPassword')}
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              size="lg"
            >
              Create Account
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
              {isGoogleLoading && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">Signing up with Google...</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                By signing up, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-800 transition-colors">Privacy Policy</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
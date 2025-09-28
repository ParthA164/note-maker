import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../common/Button';
import Input from '../common/Input';
import Alert from '../common/Alert';
import AuthService from '../../services/auth';
import { OTPData } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

const schema = yup.object({
  otp: yup.string().length(6, 'OTP must be 6 digits').required('OTP is required')
});

const OTPVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{ otp: string }>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }

    // Start countdown for resend button
    setCountdown(60);
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data: { otp: string }) => {
    try {
      setIsLoading(true);
      setError('');

      const otpData: OTPData = {
        email,
        otp: data.otp
      };

      const response = await AuthService.verifyOTP(otpData);

      if (response.success && response.data) {
        login(response.data.user, response.data.token);
        toast.success('Email verified successfully!');
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      setError('');

      const response = await AuthService.resendOTP(email);

      if (response.success) {
        toast.success('OTP sent successfully!');
        setCountdown(60);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-gray-600 mb-2">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-gray-900 text-lg">{email}</p>
        </div>

        {/* Form Container */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
          {error && <Alert type="error" message={error} />}
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

            <div className="space-y-6">
              <Input
                {...register('otp')}
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                autoComplete="one-time-code"
                error={errors.otp?.message}
                className="text-center text-2xl tracking-widest rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />

              <Button
                type="submit"
                loading={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                size="lg"
              >
                Verify Email
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{' '}
                  {countdown > 0 ? (
                    <span className="text-gray-400">
                      Resend in {countdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
                    >
                      {isResending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
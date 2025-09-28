import express, { Request, Response } from 'express';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import { generateOTP, sendOTPEmail } from '../utils/email';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Validation schemas
const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required()
});

const googleAuthSchema = Joi.object({
  token: Joi.string().required()
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }

    const { email, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      otp,
      otpExpiry,
      isEmailVerified: false
    });

    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, firstName, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail signup if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for OTP verification.',
      data: {
        email,
        firstName,
        lastName,
        isEmailVerified: false
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate account
// @access  Public
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = otpSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }

    const { email, otp } = value;

    const user = await User.findOne({ 
      email,
      otp,
      otpExpiry: { $gt: new Date() },
      isEmailVerified: false
    }).select('+otp +otpExpiry');

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
      return;
    }

    // Verify account
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP verification'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }

    const { email, password } = value;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Google OAuth login/signup
// @access  Public
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = googleAuthSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }

    const { token: googleToken } = value;

    // Development mode: Handle mock Google token
    if (googleToken === "mock_google_token_for_development" && process.env.NODE_ENV === 'development') {
      // Mock Google user data for development
      const mockPayload = {
        sub: 'dev_google_id_123',
        email: 'test@gmail.com',
        given_name: 'Test',
        family_name: 'User',
        picture: 'https://ui-avatars.com/api/?name=Test+User&background=4285f4&color=fff'
      };

      const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = mockPayload;

      // Check if user exists
      let user = await User.findOne({ $or: [{ email }, { googleId }] });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user.googleId = googleId;
          user.isEmailVerified = true;
          await user.save();
        }
      } else {
        // Create new user
        user = new User({
          email,
          firstName,
          lastName: lastName || '',
          googleId,
          profilePicture: picture || '',
          isEmailVerified: true
        });
        await user.save();
      }

      // Generate JWT token
      const jwtToken = generateToken(user);

      res.status(200).json({
        success: true,
        message: 'Development Google login successful',
        data: {
          token: jwtToken,
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified
          }
        }
      });
      return;
    }

    // Production mode: Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
      return;
    }

    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;

    if (!email || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        message: 'Incomplete Google profile information'
      });
      return;
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        await user.save();
      }
    } else {
      // Create new user
      user = new User({
        email,
        firstName,
        lastName: lastName || '',
        googleId,
        profilePicture: picture || '',
        isEmailVerified: true
      });
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: user.isNew ? 'Account created successfully with Google' : 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google authentication'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profilePicture: req.user.profilePicture,
          isEmailVerified: req.user.isEmailVerified
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    const user = await User.findOne({ email, isEmailVerified: false });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found or already verified'
      });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, user.firstName, otp);
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending OTP'
    });
  }
});

export default router;
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded: JWTPayload = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password -otp -otpExpiry');
      
      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: 'Token is not valid - user not found.' 
        });
        return;
      }

      req.user = user;
      next();
    } catch (tokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Token is not valid.' 
      });
      return;
    }
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication.' 
    });
  }
};
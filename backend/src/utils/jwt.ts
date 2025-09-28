import * as jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { IUser } from '../models/User';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id instanceof mongoose.Types.ObjectId ? user._id.toString() : String(user._id),
    email: user.email
  };

  const secret = process.env.JWT_SECRET || 'default-secret';
  
  return jwt.sign(payload, secret, { 
    expiresIn: process.env.JWT_EXPIRE || '7d' 
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.verify(token, secret) as JWTPayload;
};
import { Request } from 'express';
import { IUser } from '../interfaces/user.interface';
import { User } from '@prisma/client';
import multer from 'multer';

export interface DataStoredInToken {
  id: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithFile extends Request {
  file: multer.File;
}

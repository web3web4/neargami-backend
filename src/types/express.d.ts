// src/types/express.d.ts

import { Request } from 'express';
import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: File; // Add this line to recognize req.file
    }
  }
}

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Error:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  } else {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
};
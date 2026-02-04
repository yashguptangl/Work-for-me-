import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface AuthPayload {
    userId: string;
    email: string;
    phone: string;
    name: string;
    role: 'user' | 'owner';
}

export function userAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        if (payload.role !== 'user') return res.status(403).json({ message: 'Access denied' });
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export function ownerAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        console.log('Owner Auth - JWT Payload:', payload);
        if (payload.role !== 'owner') return res.status(403).json({ message: 'Access denied - Owner role required' });
        req.user = payload;
        next();
    } catch (err) {
        console.error('Owner Auth - JWT Error:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// Optional authentication - allows both authenticated and unauthenticated users
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        // No token provided, continue without user context
        req.user = undefined;
        return next();
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = payload;
        next();
    } catch (err) {
        // Invalid token, continue without user context
        req.user = undefined;
        next();
    }
}
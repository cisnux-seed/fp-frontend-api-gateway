// SIMULASI: Verifikasi token JWT untuk endpoint mock
import { type NextRequest } from 'next/server';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-dev';

interface AuthResult {
    isValid: boolean;
    message: string;
    decoded?: JwtPayload & { user: { id: number, username: string } };
}

export function verifyToken(req: NextRequest): AuthResult {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { isValid: false, message: "authentication required" };
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { user: { id: number, username: string } };
        return { isValid: true, message: "Token is valid", decoded };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { isValid: false, message: "token is expired" };
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return { isValid: false, message: "invalid token" };
        }
        return { isValid: false, message: "authentication failed" };
    }
}

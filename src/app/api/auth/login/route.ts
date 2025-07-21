
// SIMULASI: /api/auth/login
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-dev';

// Dummy user database
const users = [
    { id: 1, email: "johndoe@example.com", username: "johndoe", password: "SecurePassword123!" },
    { id: 2, email: "testuser@example.com", username: "testuser", password: "password123" }
];

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({
                meta: { code: "400", message: "username and password are required" },
                data: null
            }, { status: 400 });
        }

        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

        if (!user) {
            return NextResponse.json({
                meta: { code: "401", message: "invalid email or password" },
                data: null
            }, { status: 401 });
        }

        const accessToken = jwt.sign(
            { user: { id: user.id, username: user.username } },
            JWT_SECRET,
            { expiresIn: '1h' } // 1 hour expiry
        );
        const refreshToken = jwt.sign(
            { user: { id: user.id, username: user.username } },
            JWT_SECRET,
            { expiresIn: '7d' } // 7 days expiry
        );

        return NextResponse.json({
            meta: { code: "200", message: "user logged in successfully" },
            data: { accessToken, refreshToken }
        });

    } catch (error) {
        console.error('[API Login Sim] Error:', error);
        return NextResponse.json({
            meta: { code: "500", message: "Internal server error" },
            data: null
        }, { status: 500 });
    }
}

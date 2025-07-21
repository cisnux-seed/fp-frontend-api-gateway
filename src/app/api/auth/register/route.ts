// SIMULASI: /api/auth/register
import { NextResponse, type NextRequest } from 'next/server';

// "Database" dummy
const registeredUsers = new Set(["johndoe", "johndoe@example.com"]);

export async function POST(req: NextRequest) {
    try {
        const { email, username, password } = await req.json();

        if (!email || !username || !password) {
            return NextResponse.json({
                meta: { code: "400", message: "email, username, and password are required" },
                data: [{ field: "email/username/password", message: "cannot be blank" }]
            }, { status: 400 });
        }
        
        if (registeredUsers.has(username) || registeredUsers.has(email)) {
            return NextResponse.json({
                meta: { code: "409", message: "username or email already exists" },
                data: null
            }, { status: 409 });
        }
        
        // Simulasi berhasil menyimpan user
        registeredUsers.add(username);
        registeredUsers.add(email);
        
        console.log(`[API Register Sim] User baru terdaftar: ${username}`);

        return NextResponse.json({
            meta: { code: "201", message: "user registered successfully" },
            data: email
        }, { status: 201 });

    } catch (error) {
        console.error('[API Register Sim] Error:', error);
        return NextResponse.json({
            meta: { code: "500", message: "Internal server error" },
            data: null
        }, { status: 500 });
    }
}

import {API_BASE_URL} from "@/libs/constants";
import {NextRequest, NextResponse} from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': req.headers.get('cookie') || '',
            },
            body: JSON.stringify({}), // May need refresh token from cookie
            credentials: 'include',
        });

        console.log(response);

        const nextResponse = NextResponse.json({
            message: 'Logged out successfully',
        });

        // Clear cookies
        nextResponse.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 0,
        });

        nextResponse.cookies.set('refresh-token', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 0,
        });

        return nextResponse;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            {message: 'Logout completed locally'},
            {status: 200}
        );
    }
}
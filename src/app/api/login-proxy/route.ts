// src/app/api/login-proxy/route.ts

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const externalResponse = await fetch(
            'https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            }
        );

        const responseBody = await externalResponse.json();
        console.log(responseBody)

        return new Response(JSON.stringify(responseBody), {
            status: externalResponse.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy login error:', error);
        return new Response(
            JSON.stringify({ message: 'Proxy login failed', error: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

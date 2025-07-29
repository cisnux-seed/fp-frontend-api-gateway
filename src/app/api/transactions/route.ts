
import { NextResponse, type NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import type { TransactionInput } from '@/lib/types';
import jwt, { type JwtPayload } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Variabel lingkungan JWT_SECRET harus didefinisikan.');
}
const JWT_SECRET = process.env.JWT_SECRET;

// Perluas tipe untuk menyertakan data user dari token
interface AuthenticatedRequest extends NextRequest {
    user?: { id: number; username: string };
}

// Middleware untuk memverifikasi token dan mengekstrak data user
async function verifyToken(req: AuthenticatedRequest) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { error: NextResponse.json({ message: 'Akses ditolak. Token tidak tersedia.' }, { status: 401 }) };
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: number; username: string };
        req.user = { id: decoded.id, username: decoded.username };
        return { user: req.user }; // Token valid, kembalikan data user
    } catch (error) {
        return { error: NextResponse.json({ message: 'Token tidak valid atau kedaluwarsa.' }, { status: 403 }) };
    }
}

type PartnerApiResponse = {
    status: 'Success' | 'Failed';
    message?: string;
    token?: string; // Tambahkan field untuk token
};

// Fungsi untuk memanggil API mitra yang sesuai (sekarang layanan eksternal)
async function callPartnerApi(transactionDetails: Omit<TransactionInput, 'status'> & { user: { id: number; username: string } }): Promise<PartnerApiResponse> {
    const { payment_method, phone_number, nominal, user } = transactionDetails;
    let response;

    const GOPAY_SERVICE_URL = 'http://gopay-service:8081/gopay/pay'; // Alamat service Spring Boot
    const SHOPEEPAY_SERVICE_URL = 'http://shopeepay-service:8080/shopeepay/pay'; // Alamat service GoLang

    // Kunci rahasia yang lebih aman dan panjang, khusus untuk GoPay
    const GOPAY_SECRET_KEY = "ini-adalah-kunci-rahasia-gopay-yang-sangat-aman-dan-panjang";
    const SHOPEEPAY_SECRET_KEY = "shopeepay-secret-key";


    try {
        if (payment_method === 'Gojek') {
            console.log(`[BNI-BFF] Forwarding to GoPay Service: ${GOPAY_SERVICE_URL}`);
            // Membuat JWT khusus untuk otentikasi BNI ke GoPay
            const gopayToken = jwt.sign({ partner: "BNI_MOBILE" }, GOPAY_SECRET_KEY, { expiresIn: '5m' });
            
            response = await fetch(GOPAY_SERVICE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${gopayToken}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    amount: nominal,
                    description: `Top-up from BNI Mobile for ${phone_number}`,
                    phone_number: phone_number, 
                }),
            });

            const result = await response.json();

            if (!response.ok || result.status !== 'SUCCESS') {
                const errorMessage = result.message || `Transaksi ditolak oleh GoPay (HTTP ${response.status}).`;
                console.error(`[BNI-BFF] GoPay transaction failed: ${errorMessage}`);
                return { status: 'Failed', message: errorMessage };
            }
            return { status: 'Success', token: gopayToken };

        } else if (payment_method === 'ShopeePay') {
            console.log(`[BNI-BFF] Forwarding to ShopeePay Service: ${SHOPEEPAY_SERVICE_URL}`);
            // Membuat JWT khusus untuk otentikasi BNI ke ShopeePay
            const shopeeToken = jwt.sign({ partner: "BNI_MOBILE" }, SHOPEEPAY_SECRET_KEY, { expiresIn: '5m' });
            
            response = await fetch(SHOPEEPAY_SERVICE_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${shopeeToken}`
                },
                body: JSON.stringify({
                    user_id: user.id,
                    amount: nominal,
                    description: `Top-up from BNI Mobile for ${phone_number}`,
                    phone_number: phone_number,
                }),
            });
            
            const result = await response.json();

            if (!response.ok || result.status !== 'SUCCESS') {
                const errorMessage = result.message || `Transaksi ditolak oleh ShopeePay (HTTP ${response.status}).`;
                console.error(`[BNI-BFF] ShopeePay transaction failed: ${errorMessage}`);
                return { status: 'Failed', message: errorMessage };
            }
            return { status: 'Success', token: shopeeToken };

        } else {
            throw new Error('Metode pembayaran tidak didukung.');
        }
    } catch (error) {
        console.error(`[BNI-BFF] Failed to call partner API for ${payment_method}:`, error);
        return { status: 'Failed', message: `Gagal terhubung ke layanan ${payment_method}. Pastikan layanan tersebut berjalan.` };
    }
}


export async function POST(req: AuthenticatedRequest) {
  const authResult = await verifyToken(req);
  if (authResult.error) return authResult.error;
  if (!authResult.user) {
    return NextResponse.json({ message: 'User tidak terautentikasi.' }, { status: 401 });
  }
  const user = authResult.user;

  try {
    const transactionInput = await req.json() as Omit<TransactionInput, 'status'>;

    if (!transactionInput.payment_method || !transactionInput.phone_number || !transactionInput.nominal) {
      return NextResponse.json({ message: 'Data transaksi tidak lengkap.' }, { status: 400 });
    }
    
    // Perbaiki nama field agar sesuai dengan DTO di Java
    const transactionDetails = {
        payment_method: transactionInput.payment_method,
        phone_number: transactionInput.phone_number,
        nominal: transactionInput.nominal,
        transaction_type: transactionInput.transaction_type,
        user: user,
    };
    
    const pool = getPool();
    const client = await pool.connect();
    try {
      // Panggil API mitra untuk validasi terlebih dahulu
      const partnerResponse = await callPartnerApi(transactionDetails);
      
      // Apapun hasilnya (Sukses/Gagal), kita catat di DB BNI
      const status = partnerResponse.status === 'Success' ? 'Success' : 'Failed';

      await client.query('BEGIN');

      // Hanya kurangi saldo jika transaksi di mitra berhasil
      if (status === 'Success') {
        const balanceResult = await client.query('SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE', [user.id]);
        if (balanceResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return NextResponse.json({ message: 'Akun pengguna BNI tidak ditemukan.' }, { status: 404 });
        }
        
        const currentBalance = parseFloat(balanceResult.rows[0].balance);
        if (currentBalance < transactionInput.nominal) {
          await client.query('ROLLBACK');
          // Buat transaksi gagal karena saldo tidak cukup, tapi catat di DB
          const failedTxQuery = `
            INSERT INTO transactions (user_id, payment_method, phone_number, transaction_type, nominal, status, message)
            VALUES ($1, $2, $3, $4, $5, 'Failed', 'Saldo tidak mencukupi') RETURNING id;
          `;
          await client.query(failedTxQuery, [user.id, transactionInput.payment_method, transactionInput.phone_number, transactionInput.transaction_type, transactionInput.nominal]);
          await client.query('COMMIT');
          // Kembalikan error yang jelas ke frontend
          return NextResponse.json({ message: 'Saldo BNI tidak mencukupi untuk melakukan transaksi ini.' }, { status: 400 });
        }
        
        // Kurangi saldo BNI
        await client.query('UPDATE accounts SET balance = $1 WHERE user_id = $2', [currentBalance - transactionInput.nominal, user.id]);
      }

      // Catat transaksi (baik sukses maupun gagal dari mitra)
      const insertQuery = `
        INSERT INTO transactions (user_id, payment_method, phone_number, transaction_type, nominal, status, message)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const transactionValues = [
        user.id,
        transactionInput.payment_method,
        transactionInput.phone_number,
        transactionInput.transaction_type,
        transactionInput.nominal,
        status,
        partnerResponse.message // Simpan pesan dari mitra (jika ada)
      ];
      
      const transactionResult = await client.query(insertQuery, transactionValues);
      const newTransaction = transactionResult.rows[0];

      await client.query('COMMIT');

      // Jika transaksi GAGAL, kembalikan respons error yang sesuai ke frontend
      if (status === 'Failed') {
        // Meskipun gagal, kita kirim data transaksi yang tercatat ke frontend agar bisa ditampilkan di halaman hasil
        return NextResponse.json(newTransaction, { status: 400 });
      }
      
      // Tambahkan token partner ke respons jika transaksi berhasil
      const finalResponse = {
          ...newTransaction,
          partner_token: partnerResponse.token,
      };

      return NextResponse.json(finalResponse, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction processing error:', error);
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: 'Terjadi kesalahan pada server saat memproses transaksi.' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API endpoint error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function GET(req: AuthenticatedRequest) {
    const authResult = await verifyToken(req);
    if (authResult.error) return authResult.error;
    if (!authResult.user) {
        return NextResponse.json({ message: 'User tidak terautentikasi.' }, { status: 401 });
    }
    const userId = authResult.user.id;

    const pool = getPool();
    const client = await pool.connect();
    try {
        const balanceQuery = 'SELECT balance FROM accounts WHERE user_id = $1';
        const balanceResult = await client.query(balanceQuery, [userId]);
        
        if (balanceResult.rows.length === 0) {
            return NextResponse.json({ message: 'Akun pengguna tidak ditemukan.' }, { status: 404 });
        }
        const balance = parseFloat(balanceResult.rows[0].balance);

        const historyQuery = 'SELECT id, user_id, date, payment_method, phone_number, transaction_type, nominal, status, message FROM transactions WHERE user_id = $1 ORDER BY date DESC';
        const historyResult = await client.query(historyQuery, [userId]);
        const history = historyResult.rows;

        return NextResponse.json({ balance, history }, { status: 200 });
    } catch (error) {
        console.error('Gagal mengambil data pengguna:', error);
        return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
    } finally {
        client.release();
    }
}

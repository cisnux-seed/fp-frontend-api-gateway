// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useTransaction } from '@/hooks/use-transaction';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { CheckCircle2, XCircle, ArrowLeft, LogOut } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { GojekIcon, OvoIcon, ShopeePayIcon } from '@/components/icons';

// const paymentIcons = {
//   Gojek: GojekIcon,
//   OVO: OvoIcon,
//   ShopeePay: ShopeePayIcon,
// };

// export default function ResultPage() {
//   const { transaction, logout, isLoggedIn, isInitializing } = useTransaction();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isInitializing && !isLoggedIn) {
//       router.replace('/login');
//     }
//     if (!isInitializing && !transaction) {
//         // If there's no transaction data, go back to create one
//         router.replace('/transaction');
//     }
//   }, [transaction, isLoggedIn, isInitializing, router]);

//   if (isInitializing || !transaction) {
//     return (
//       <div className="flex min-h-screen w-full items-center justify-center">
//         <p>Memuat hasil transaksi...</p>
//       </div>
//     );
//   }

//   const isSuccess = transaction.status === 'Success';
//   const PaymentIcon = paymentIcons[transaction.paymentMethod];

//   return (
//     <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader className="items-center text-center">
//           {isSuccess ? (
//             <CheckCircle2 className="h-16 w-16 text-green-500" />
//           ) : (
//             <XCircle className="h-16 w-16 text-red-500" />
//           )}
//           <CardTitle className={cn('text-3xl', isSuccess ? 'text-green-600' : 'text-red-600')}>
//             Transaksi {isSuccess ? 'Berhasil' : 'Gagal'}
//           </CardTitle>
//           <CardDescription>Berikut adalah rincian transaksi Anda.</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="rounded-lg border p-4 space-y-3">
//               <InfoRow label="Nomor Telepon" value={transaction.phoneNumber} />
//               <InfoRow label="Mitra Pembayaran">
//                 <div className="flex items-center gap-2">
//                     {PaymentIcon && <PaymentIcon className="h-5 w-5" />}
//                     <span>{transaction.paymentMethod}</span>
//                 </div>
//               </InfoRow>
//               <InfoRow label="Jenis Transaksi" value={transaction.transactionType} />
//               <InfoRow label="Nominal" value={`Rp${transaction.nominal.toLocaleString('id-ID')}`} />
//           </div>
//         </CardContent>
//         <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           <Button variant="outline" onClick={() => router.push('/transaction')}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Transaksi Baru
//           </Button>
//           <Button onClick={logout}>
//             <LogOut className="mr-2 h-4 w-4" />
//             Logout
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

// const InfoRow = ({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) => (
//   <div className="flex justify-between items-center text-sm">
//     <p className="text-muted-foreground">{label}</p>
//     {value && <p className="font-semibold">{value}</p>}
//     {children}
//   </div>
// );

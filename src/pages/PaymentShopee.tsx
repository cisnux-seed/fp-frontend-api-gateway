import { useNavigate } from 'react-router-dom';
import { hitBNIPaymentGateway } from '../services/bniApi';

const PaymentGopay = () => {
  const navigate = useNavigate();

  const handlePay = async () => {
    await hitBNIPaymentGateway('gopay', 50000);
    navigate('/bni/redirect');
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-bold mb-2">Pembayaran GoPay</h2>
      <p className="mb-4">Total: Rp50.000</p>
      <button onClick={handlePay} className="bg-green-500 text-white px-4 py-2 rounded">Bayar Sekarang</button>
    </div>
  );
};

export default PaymentGopay;

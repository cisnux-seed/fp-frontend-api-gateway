import React from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentMethodCard from '../components/PaymentMethodCard';

const PaymentSelection = () => {
  const navigate = useNavigate();
  const methods = ['gopay', 'shopee', 'doku'];

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Pilih Metode Pembayaran</h1>
      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <PaymentMethodCard key={method} method={method} onSelect={() => navigate(`/payment/${method}`)} />
        ))}
      </div>
    </div>
  );
};

export default PaymentSelection;

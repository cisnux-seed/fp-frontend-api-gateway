import React, { useState } from 'react';

interface Props {
  selectedItem: { label: string; price: number } | null;
  quantity: number;
  setQuantity: (q: number) => void;
}

const OrderSidebar = ({ selectedItem, quantity, setQuantity }: Props) => {
  const [userId, setUserId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePurchase = () => {
    if (!selectedItem || !userId || !zoneId) {
      alert('Lengkapi semua field sebelum membeli.');
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Informasi Pesanan</h2>
      <input
        placeholder="User ID"
        className="border w-full mb-2 p-2 rounded"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        placeholder="Zone ID"
        className="border w-full mb-2 p-2 rounded"
        value={zoneId}
        onChange={(e) => setZoneId(e.target.value)}
      />

      <div className="flex items-center gap-2 mb-2">
        <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>

      <div className="text-lg font-bold mb-2">
        Total: Rp{selectedItem ? (selectedItem.price * quantity).toLocaleString() : 0}
      </div>

      <button
        onClick={handlePurchase}
        className="w-full bg-orange-500 text-white py-2 rounded"
        disabled={!selectedItem}
      >
        Beli Sekarang
      </button>

      {success && (
        <p className="text-green-600 mt-2 font-medium">
          Transaksi berhasil untuk {quantity}x {selectedItem?.label}!
        </p>
      )}
    </div>
  );
};

export default OrderSidebar;

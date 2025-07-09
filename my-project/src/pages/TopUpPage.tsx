import React, { useState } from 'react';
import ProductTabs from '../components/ProductTabs';
import FilterTags from '../components/FilterTags';
import ItemCard from '../components/ItemCard';

const TopUpPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<{ price: number; label: string } | null>(null);

  const items = [
    { label: '3 Diamonds', price: 1200 },
    { label: '122 Diamonds', price: 33090 },
    { label: '366 Diamonds', price: 95500 },
    { label: '5 Diamonds', price: 1700 },
    { label: '257 Diamonds', price: 67500 },
    { label: '568 Diamonds', price: 138000 },
    { label: '50 Diamonds', price: 18500 },
    { label: '220 Diamonds', price: 59500 },
  ];

  const totalPrice = selectedItem ? selectedItem.price * quantity : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Seller Pilihan di Mobile Legends</h1>
        <ProductTabs />
        <FilterTags />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {items.map((item, idx) => (
            <ItemCard key={idx} item={item} setSelectedItem={setSelectedItem} />
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow max-w-md">
          <h2 className="text-lg font-semibold mb-2">Informasi Pesanan</h2>
          <input placeholder="User ID" className="border w-full mb-2 p-2 rounded" />
          <input placeholder="Zone ID" className="border w-full mb-2 p-2 rounded" />

          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>

          <div className="text-lg font-bold mb-2">Total: Rp{totalPrice.toLocaleString()}</div>
          <button className="w-full bg-orange-500 text-white py-2 rounded">Beli Sekarang</button>
        </div>
      </div>
    </div>
  );
};

export default TopUpPage;
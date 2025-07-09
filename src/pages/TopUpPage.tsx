import React, { useState } from 'react';
import ProductTabs from '../components/ProductTabs';
import FilterTags from '../components/FilterTags';
import ItemCard from '../components/ItemCard';
import OrderSidebar from '../components/OrderSidebar';

const TopUpPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState<{ label: string; price: number } | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kiri: Produk dan Filter */}
        <div className="md:col-span-2">
          <h1 className="text-xl font-bold mb-4">Seller Pilihan di Mobile Legends</h1>
          <ProductTabs />
          <FilterTags />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {items.map((item, idx) => (
              <ItemCard key={idx} item={item} setSelectedItem={setSelectedItem} />
            ))}
          </div>
        </div>

        {/* Kanan: Order Form */}
        <OrderSidebar
          selectedItem={selectedItem}
          quantity={quantity}
          setQuantity={setQuantity}
        />
      </div>
    </div>
  );
};

export default TopUpPage;

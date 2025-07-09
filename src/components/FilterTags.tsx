const FilterTags = () => (
  <div className="flex gap-2 mb-4">
    <input
      type="text"
      placeholder="Cari nominal"
      className="border px-4 py-2 rounded w-64"
    />
    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-sm">Terbaik</span>
    <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-sm">Pengiriman Instan</span>
    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">Termurah</span>
    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm">10 Menit Kirim</span>
  </div>
);

export default FilterTags;
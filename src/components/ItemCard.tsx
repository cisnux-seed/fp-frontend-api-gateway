interface Props {
  item: { label: string; price: number };
  setSelectedItem: (item: { label: string; price: number }) => void;
}

const ItemCard = ({ item, setSelectedItem }: Props) => {
  return (
    <button
      onClick={() => setSelectedItem(item)}
      className="border rounded p-4 hover:bg-blue-50 w-full text-left"
    >
      <div className="font-semibold">{item.label}</div>
      <div className="text-orange-600 font-bold">Rp{item.price.toLocaleString()}</div>
    </button>
  );
};

export default ItemCard;
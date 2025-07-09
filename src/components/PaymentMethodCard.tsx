const PaymentMethodCard = ({ method, onSelect }: { method: string; onSelect: () => void }) => {
  return (
    <button onClick={onSelect} className="flex items-center gap-4 p-4 border rounded shadow hover:bg-gray-100">
      <img src={`/assets/${method}.png`} alt={method} className="w-10 h-10" />
      <span className="capitalize font-semibold">{method}</span>
    </button>
  );
};

export default PaymentMethodCard;

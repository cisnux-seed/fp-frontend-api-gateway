import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BniRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/success');
    }, 1500);
  }, []);

  return <p className="text-center p-4">Memproses pembayaran melalui BNI...</p>;
};

export default BniRedirect;

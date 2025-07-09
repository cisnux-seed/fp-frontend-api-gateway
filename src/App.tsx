import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import TopUpPage from './pages/TopUpPage';
import PaymentSelection from './pages/PaymentSelection';
import PaymentGopay from './pages/PaymentGopay';
import PaymentShopee from './pages/PaymentShopee';
import PaymentDoku from './pages/PaymentDoku';
import BniRedirect from './pages/BniRedirect';
import InternalSuccess from './pages/InternalSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TopUpPage />} />
        <Route path="/select-payment" element={<PaymentSelection />} />
        <Route path="/payment/gopay" element={<PaymentGopay />} />
        <Route path="/payment/shopee" element={<PaymentShopee />} />
        <Route path="/payment/doku" element={<PaymentDoku />} />
        <Route path="/bni/redirect" element={<BniRedirect />} />
        <Route path="/success" element={<InternalSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;

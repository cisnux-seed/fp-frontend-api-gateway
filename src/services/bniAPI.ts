export const hitBNIPaymentGateway = async (method: string, amount: number) => {
  console.log(`Mengirim ke BNI: metode=${method}, jumlah=${amount}`);
  await new Promise((res) => setTimeout(res, 1000));
  return { status: 'success' };
};

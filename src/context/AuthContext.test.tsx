import { toast } from "@/hooks/use-toast";
import { TopUpRequest, Transaction } from "@/libs/types";
import { useCallback } from "react";

const topUp = useCallback(
  async (request: TopUpRequest): Promise<Transaction> => {
    try {
      const response = await authenticatedFetch('/api/payment/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request), // langsung kirim request
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Top-up failed');
      }

      // Refresh balance setelah top-up sukses
      await fetchBalance();

      toast({
        title: 'Top-up Successful',
        description: `Successfully topped up ${request.amount.toLocaleString()} IDR`,
      });

      return data.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Top-up failed';
      toast({
        variant: 'destructive',
        title: 'Top-up Failed',
        description: message,
      });
      throw error;
    }
  },
  [authenticatedFetch, fetchBalance, toast]
);
function fetchBalance() {
    throw new Error("Function not implemented.");
}

function authenticatedFetch(arg0: string, arg1: { method: string; headers: { 'Content-Type': string; }; body: string; }): Promise<Response> {
    throw new Error("Function not implemented.");
}


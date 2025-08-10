// src/hooks/usePaymentStatusCheck.js
import { useState, useEffect } from "react";
import { supabase } from "@/supabase";

export const usePaymentStatusCheck = (request, user) => {
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const checkPaymentStatus = async (force = false) => {
    if (!request || !user || (!force && request.payment_data)) {
      return; // Already has payment data, no need to check
    }

    setCheckingPayment(true);

    try {
      console.log("🔍 Checking payment status for request:", request.id);

      const { data, error } = await supabase.functions.invoke(
        "check-shopify-payment-status",
        {
          body: {
            requestId: request.id,
            cartId: request.cart_data?.cart_id,
            checkoutUrl: request.cart_data?.checkout_url,
          },
        }
      );

      if (error) {
        console.error("Payment status check error:", error);
        return;
      }

      console.log("✅ Payment status check result:", data);
      setPaymentStatus(data);

      // If payment was discovered and database was updated,
      // we need to refresh the request data
      if (data.updatedDatabase) {
        console.log("🔄 Payment discovered, refreshing page data...");
        // Trigger a page refresh or data refetch
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Payment status check failed:", error);
    } finally {
      setCheckingPayment(false);
    }
  };

  // Auto-check on component mount if no payment data exists
  useEffect(() => {
    if (request && user && !request.payment_data) {
      // Wait a bit before checking to avoid immediate API calls
      const timer = setTimeout(() => {
        checkPaymentStatus();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [request?.id, user?.id]);

  // Periodic check for pending payments (every 30 seconds)
  useEffect(() => {
    if (request && user && !request.payment_data) {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(interval);
    }
  }, [request?.id, user?.id, request?.payment_data]);

  return {
    checkingPayment,
    paymentStatus,
    checkPaymentStatus: () => checkPaymentStatus(true), // Manual check
  };
};

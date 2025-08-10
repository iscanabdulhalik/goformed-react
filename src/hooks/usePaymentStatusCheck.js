// src/hooks/usePaymentStatusCheck.js - Enhanced with better protection
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase";

export const usePaymentStatusCheck = (request, user) => {
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  // ✅ ENHANCED: Better payment validation
  const isPaymentAlreadyComplete = useCallback((requestData) => {
    if (!requestData) return false;

    // Check payment data existence and validity
    const hasValidPaymentData = !!(
      requestData.payment_data &&
      requestData.payment_data.order_id &&
      requestData.payment_data.total_price &&
      parseFloat(requestData.payment_data.total_price) > 0 &&
      (requestData.payment_data.financial_status === "paid" ||
        requestData.payment_data.financial_status === "partially_paid" ||
        requestData.payment_data.is_test_order === true)
    );

    // Check status-based completion
    const paymentCompletedStatuses = [
      "payment_completed",
      "in_review",
      "processing",
      "completed",
    ];
    const hasCompletedStatus = paymentCompletedStatuses.includes(
      requestData.status
    );

    // Check cart completion
    const hasCompletedCheckout =
      requestData.cart_data?.checkout_completed === true;

    console.log("💳 Payment completion check:", {
      hasValidPaymentData,
      hasCompletedStatus,
      hasCompletedCheckout,
      currentStatus: requestData.status,
      paymentData: !!requestData.payment_data,
    });

    return hasValidPaymentData || hasCompletedStatus || hasCompletedCheckout;
  }, []);

  // ✅ ENHANCED: Check payment status with throttling and validation
  const checkPaymentStatus = useCallback(
    async (force = false) => {
      if (!request || !user) {
        console.log("🚫 Missing request or user data");
        return;
      }

      // ✅ ENHANCED: Prevent multiple simultaneous checks
      if (checkingPayment && !force) {
        console.log("🚫 Payment check already in progress");
        return;
      }

      // ✅ ENHANCED: Rate limiting - don't check more than once per minute unless forced
      const now = Date.now();
      if (!force && lastChecked && now - lastChecked < 60000) {
        console.log(
          "🚫 Payment check rate limited (less than 1 minute since last check)"
        );
        return;
      }

      // ✅ ENHANCED: Don't check if payment is already confirmed
      if (!force && isPaymentAlreadyComplete(request)) {
        console.log("✅ Payment already confirmed, skipping check");
        return;
      }

      setCheckingPayment(true);
      setLastChecked(now);

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
          console.error("❌ Payment status check error:", error);
          setPaymentStatus({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        console.log("✅ Payment status check result:", data);
        setPaymentStatus(data);

        // ✅ ENHANCED: If payment was discovered, mark checkout as completed in session
        if (data.updatedDatabase && data.hasPayment) {
          console.log("🔄 Payment discovered, updating local state...");

          // Clear any payment attempted flags
          const sessionPaymentKey = `payment_attempted_${request.id}`;
          sessionStorage.removeItem(sessionPaymentKey);

          // Mark checkout as completed
          try {
            await supabase
              .from("company_requests")
              .update({
                cart_data: {
                  ...request.cart_data,
                  checkout_completed: true,
                  payment_discovered_at: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
              })
              .eq("id", request.id);
          } catch (updateError) {
            console.warn(
              "⚠️ Could not update cart completion status:",
              updateError
            );
          }

          // Refresh the page to show updated data
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        console.error("💥 Payment status check failed:", error);
        setPaymentStatus({
          success: false,
          error: error.message || "Payment check failed",
          timestamp: new Date().toISOString(),
        });
      } finally {
        setCheckingPayment(false);
      }
    },
    [request, user, checkingPayment, lastChecked, isPaymentAlreadyComplete]
  );

  // ✅ ENHANCED: Auto-check on component mount with better conditions
  useEffect(() => {
    if (!request || !user) return;

    // Don't auto-check if payment is already complete
    if (isPaymentAlreadyComplete(request)) {
      console.log("✅ Payment already complete, skipping auto-check");
      return;
    }

    // Don't auto-check if no cart data exists
    if (!request.cart_data?.cart_id && !request.cart_data?.checkout_url) {
      console.log("ℹ️ No cart data, skipping auto-check");
      return;
    }

    // Don't auto-check for completed/cancelled requests
    const finalStatuses = ["completed", "cancelled", "rejected"];
    if (finalStatuses.includes(request.status)) {
      console.log("ℹ️ Request in final status, skipping auto-check");
      return;
    }

    // Wait a bit before checking to avoid immediate API calls
    const timer = setTimeout(() => {
      checkPaymentStatus(false);
    }, 3000); // 3 second delay

    return () => clearTimeout(timer);
  }, [
    request?.id,
    user?.id,
    request?.status,
    checkPaymentStatus,
    isPaymentAlreadyComplete,
  ]);

  // ✅ ENHANCED: Periodic check with smarter intervals
  useEffect(() => {
    if (!request || !user) return;

    // Don't set up periodic checks if payment is complete
    if (isPaymentAlreadyComplete(request)) {
      console.log("✅ Payment complete, stopping periodic checks");
      return;
    }

    // Only set up periodic checks if there's pending payment activity
    const hasPendingPayment =
      request.cart_data?.cart_id &&
      !request.payment_data &&
      !["completed", "cancelled", "rejected"].includes(request.status);

    if (!hasPendingPayment) {
      console.log("ℹ️ No pending payment activity, skipping periodic checks");
      return;
    }

    // ✅ ENHANCED: Progressive intervals (more frequent initially, then slower)
    let intervalTime = 30000; // Start with 30 seconds
    const maxInterval = 120000; // Max 2 minutes
    let currentInterval = intervalTime;

    const setupNextCheck = () => {
      const timer = setTimeout(async () => {
        await checkPaymentStatus(false);

        // Increase interval time (but cap it)
        currentInterval = Math.min(currentInterval + 15000, maxInterval);
        setupNextCheck();
      }, currentInterval);

      return timer;
    };

    const timer = setupNextCheck();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    request?.id,
    user?.id,
    request?.payment_data,
    request?.status,
    checkPaymentStatus,
    isPaymentAlreadyComplete,
  ]);

  // ✅ ENHANCED: Manual check function with validation
  const manualCheckPaymentStatus = useCallback(() => {
    if (!request || !user) {
      console.log("🚫 Cannot check payment: missing request or user");
      return Promise.resolve();
    }

    if (checkingPayment) {
      console.log("🚫 Payment check already in progress");
      return Promise.resolve();
    }

    console.log("🔄 Manual payment status check triggered");
    return checkPaymentStatus(true); // Force check
  }, [request, user, checkingPayment, checkPaymentStatus]);

  return {
    checkingPayment,
    paymentStatus,
    checkPaymentStatus: manualCheckPaymentStatus,
    lastChecked,
    isPaymentComplete: isPaymentAlreadyComplete(request),
  };
};

// src/hooks/useNotifications.js - Fixed for actual database schema
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch notifications with proper field selection based on your actual schema
      const { data, error: fetchError } = await supabase
        .from("user_notifications")
        .select(
          `
          id,
          read,
          read_at,
          created_at,
          title,
          message,
          type,
          notification_id,
          notifications (
            title,
            message,
            type
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching notifications:", fetchError);
        throw fetchError;
      }

      // Transform the data to ensure we have title, message, and type
      const transformedNotifications = (data || []).map((notification) => {
        // Use direct fields first, then fall back to related notification, then defaults
        const title =
          notification.title ||
          notification.notifications?.title ||
          "Notification";

        const message =
          notification.message ||
          notification.notifications?.message ||
          "New notification";

        const type =
          notification.type || notification.notifications?.type || "info";

        return {
          id: notification.id,
          title,
          message,
          type,
          read: notification.read || false,
          read_at: notification.read_at,
          created_at: notification.created_at,
          // Keep original data for debugging
          _original: notification,
        };
      });

      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications.");

      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    // Only set up real-time subscription if userId exists
    if (!userId) return;

    const channel = supabase
      .channel(`user_notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Notification change:", payload);
          // Refresh notifications on any change
          fetchNotifications();
        }
      )
      .subscribe((status) => {
        console.log("Notification subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state optimistically
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, read_at: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));

      return true;
    } catch (err) {
      console.error("Error marking as read:", err);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      // Update local state
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, read_at: now }))
      );
      setUnreadCount(0);

      return true;
    } catch (err) {
      console.error("Error marking all as read:", err);
      return false;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      const deletedNotif = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
      }

      return true;
    } catch (err) {
      console.error("Error deleting notification:", err);
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};

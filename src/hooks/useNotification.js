// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_notifications")
        .select(
          `
          id,
          read,
          title,
          message,
          type,
          created_at
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Veriyi direkt kullanabiliriz
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel(`user_notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
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
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
  };
};

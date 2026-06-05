"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "μόλις τώρα";
  if (mins < 60) return `${mins} λ. πριν`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ω. πριν`;
  const days = Math.floor(hrs / 24);
  return `${days} μ. πριν`;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]   = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Initial fetch
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("notifications")
        .select("id, message, read, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setNotifications(data as Notification[]);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev =>
            [payload.new as Notification, ...prev].slice(0, 10)
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications(prev =>
            prev.map(n =>
              n.id === (payload.new as Notification).id
                ? (payload.new as Notification)
                : n
            )
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const handleMarkRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await markNotificationRead(id);
  }, []);

  const handleMarkAll = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Ειδοποιήσεις"
        style={{
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 36, height: 36,
          borderRadius: 8, border: "none",
          background: open ? "#F0F4F8" : "transparent",
          cursor: "pointer", color: "#1B3A5C",
          flexShrink: 0,
          transition: "background 0.1s",
        }}
      >
        <Bell style={{ width: 20, height: 20 }} />
        {/* Unread badge */}
        {!loading && unreadCount > 0 && (
          <span style={{
            position: "absolute", top: 5, right: 5,
            background: "#D94040", color: "white",
            fontSize: 9, fontWeight: 700, lineHeight: 1,
            minWidth: 15, height: 15, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
            pointerEvents: "none",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 320,
          background: "white",
          borderRadius: 12,
          border: "1px solid #E8ECF0",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 100,
          overflow: "hidden",
        }}>
          {/* Header row */}
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid #F0F2F5",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1B3A5C" }}>
              Ειδοποιήσεις
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 6,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "#FEE2E2", color: "#D94040",
                  fontSize: 10, fontWeight: 700,
                  minWidth: 18, height: 18, borderRadius: 9, padding: "0 4px",
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                style={{ fontSize: 11, color: "#2563EB", fontWeight: 500, border: "none", background: "none", cursor: "pointer", padding: 0 }}
              >
                Όλα ως αναγνωσμένα
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "24px 16px", textAlign: "center", fontSize: 13, color: "#9CA3AF" }}>
                Φόρτωση…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Bell style={{ width: 28, height: 28, color: "#D1D5DB", margin: "0 auto 8px" }} />
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>Δεν υπάρχουν ειδοποιήσεις.</p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: idx < notifications.length - 1 ? "1px solid #F0F2F5" : "none",
                    background: n.read ? "white" : "#EFF6FF",
                    cursor: n.read ? "default" : "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    transition: "background 0.1s",
                  }}
                >
                  {/* Unread dot */}
                  <div style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    flexShrink: 0,
                    marginTop: 5,
                    background: n.read ? "transparent" : "#2563EB",
                    border: n.read ? "none" : "none",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, color: "#1B3A5C", lineHeight: "1.45", margin: 0 }}>
                      {n.message}
                    </p>
                    <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

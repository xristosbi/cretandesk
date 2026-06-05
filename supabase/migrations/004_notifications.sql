-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX notifications_user_id_created_at_idx
  ON notifications (user_id, created_at DESC);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (used in server actions) can insert for any user
CREATE POLICY "Service role insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- Full replica identity so Realtime UPDATE events carry old row values
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Publish to Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

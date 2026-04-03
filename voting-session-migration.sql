-- Tabelă pentru sesiuni de votare Best Car of the Show
CREATE TABLE IF NOT EXISTS voting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexuri
CREATE INDEX IF NOT EXISTS idx_voting_sessions_active ON voting_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_started ON voting_sessions(started_at);

-- RLS Policies
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can read voting sessions
CREATE POLICY "Anyone can view voting sessions"
  ON voting_sessions FOR SELECT
  USING (true);

-- Only admins can create/update voting sessions
CREATE POLICY "Only admins can manage voting sessions"
  ON voting_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'organizer')
    )
  );

-- Activare Realtime pentru tabelele tickets și ticket_messages

-- Enable Realtime pentru tickets
ALTER TABLE tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;

-- Enable Realtime pentru ticket_messages
ALTER TABLE ticket_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_messages;

-- Verificare (optional)
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

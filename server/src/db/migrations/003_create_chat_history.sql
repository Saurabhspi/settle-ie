CREATE TYPE message_role AS ENUM ('user', 'assistant');

CREATE TABLE chat_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       message_role NOT NULL,
  content    TEXT NOT NULL,
  sources    JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
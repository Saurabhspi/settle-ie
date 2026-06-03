CREATE TABLE documents (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doc_type       VARCHAR(100),
  s3_key         VARCHAR(500),
  ai_validation  JSONB,
  expiry_date    DATE,
  uploaded_at    TIMESTAMP DEFAULT NOW()
);
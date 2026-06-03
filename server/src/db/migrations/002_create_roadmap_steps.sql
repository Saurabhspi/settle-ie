CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'done');

CREATE TABLE roadmap_steps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_key     VARCHAR(100) NOT NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  status       step_status DEFAULT 'pending',
  order_index  INT NOT NULL,
  due_date     DATE,
  created_at   TIMESTAMP DEFAULT NOW()
);

ALTER TABLE roadmap_steps
ADD CONSTRAINT unique_user_step UNIQUE (user_id, step_key);
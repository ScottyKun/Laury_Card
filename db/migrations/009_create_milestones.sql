CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    minor_frequency VARCHAR(20) NOT NULL CHECK (minor_frequency IN ('monthly', 'bimonthly')),
    minor_day INTEGER NOT NULL CHECK (minor_day BETWEEN 1 AND 28),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
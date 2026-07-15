CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT one_target_only CHECK (
        (card_id IS NOT NULL AND book_id IS NULL) OR (card_id IS NULL AND book_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_shares_recipient ON shares(recipient_id);
CREATE INDEX IF NOT EXISTS idx_shares_sender ON shares(sender_id);
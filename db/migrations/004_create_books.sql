CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Livre sans titre',
    cover_thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE transition_type AS ENUM ('fade', 'slide', 'flip', 'none');

CREATE TABLE IF NOT EXISTS book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    transition_type transition_type NOT NULL DEFAULT 'fade',
    UNIQUE (book_id, position)
);

CREATE INDEX IF NOT EXISTS idx_books_owner_id ON books(owner_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_book_id ON book_pages(book_id);
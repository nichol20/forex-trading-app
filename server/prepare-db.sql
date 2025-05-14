CREATE DATABASE forex;

\c forex;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^.+@.+\..+$'),
    hubspot_contact_id TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    wallet JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE DOMAIN positive_numeric AS NUMERIC(18, 10) CHECK (VALUE >= 0);

CREATE TABLE IF NOT EXISTS exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hubspot_deal_id TEXT NOT NULL UNIQUE,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    from_amount positive_numeric NOT NULL,
    to_amount positive_numeric NOT NULL,
    exchange_rate positive_numeric NOT NULL,
    exchanged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_wallets table for multi-wallet support
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(255) NOT NULL,
    wallet_name VARCHAR(100) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    connected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, wallet_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_wallet_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_wallets_is_primary ON user_wallets(user_id, is_primary);

-- Add wallet limits to subscription plans features
UPDATE subscription_plans 
SET features = jsonb_set(
    features, 
    '{max_wallets}', 
    CASE 
        WHEN name = 'free' THEN '1'
        WHEN name = 'basic' THEN '3'
        WHEN name = 'pro' THEN '5'
        WHEN name = 'elite' THEN '10'
        ELSE '1'
    END::jsonb
)
WHERE name IN ('free', 'basic', 'pro', 'elite');

-- Add wallet management feature to plan descriptions
UPDATE subscription_plans 
SET features = jsonb_set(
    features, 
    '{features}', 
    CASE 
        WHEN name = 'free' THEN features->'features' || '["Single wallet connection"]'::jsonb
        WHEN name = 'basic' THEN features->'features' || '["Multi-wallet support (up to 3 wallets)"]'::jsonb
        WHEN name = 'pro' THEN features->'features' || '["Advanced multi-wallet support (up to 5 wallets)"]'::jsonb
        WHEN name = 'elite' THEN features->'features' || '["Unlimited wallet connections"]'::jsonb
        ELSE features->'features'
    END
)
WHERE name IN ('free', 'basic', 'pro', 'elite');

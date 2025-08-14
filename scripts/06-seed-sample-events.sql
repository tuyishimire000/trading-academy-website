-- Seed sample upcoming events
INSERT INTO events (title, description, event_type, start_time, end_time, meeting_url, max_participants, required_plan, status) VALUES
(
    'Live Trading Session - Market Analysis',
    'Join our expert traders for live market analysis and trading opportunities.',
    'live_session',
    CURRENT_TIMESTAMP + INTERVAL '2 hours',
    CURRENT_TIMESTAMP + INTERVAL '3 hours',
    'https://discord.gg/trading-session',
    100,
    'basic',
    'scheduled'
),
(
    'Q&A Webinar with Head Trader',
    'Ask questions and get answers from our head trader about market strategies.',
    'webinar',
    CURRENT_TIMESTAMP + INTERVAL '1 day 19 hours',
    CURRENT_TIMESTAMP + INTERVAL '1 day 20 hours',
    'https://zoom.us/webinar/qa-session',
    200,
    'basic',
    'scheduled'
),
(
    'Options Trading Workshop',
    'Advanced workshop covering options strategies and risk management.',
    'workshop',
    CURRENT_TIMESTAMP + INTERVAL '4 days 15 hours',
    CURRENT_TIMESTAMP + INTERVAL '4 days 17 hours',
    'https://discord.gg/options-workshop',
    50,
    'pro',
    'scheduled'
),
(
    'Crypto Market Deep Dive',
    'Comprehensive analysis of cryptocurrency markets and trading opportunities.',
    'live_session',
    CURRENT_TIMESTAMP + INTERVAL '7 days 14 hours',
    CURRENT_TIMESTAMP + INTERVAL '7 days 16 hours',
    'https://discord.gg/crypto-session',
    75,
    'pro',
    'scheduled'
);

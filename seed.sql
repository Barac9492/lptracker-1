-- Insert sample LPs
INSERT INTO "LP" ("id", "name", "contactName", "email", "geo", "strategy", "score", "messageAngle", "createdAt", "updatedAt") VALUES
('clp1x001', 'Sequoia Capital', 'Sarah Chen', 'sarah@sequoia.com', 'USA', ARRAY['Growth', 'Enterprise SaaS', 'B2B'], 6.0, 'Congrats on recent funding - discuss growth opportunities', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clp1x002', 'Andreessen Horowitz', 'Michael Rodriguez', 'michael@a16z.com', 'USA', ARRAY['Early Stage', 'Crypto', 'Consumer'], 3.9, 'Build on recent partnership momentum', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clp1x003', 'Index Ventures', 'Emma Thompson', 'emma@indexventures.com', 'Europe', ARRAY['Series A', 'Fintech', 'Marketplaces'], 2.3, 'Recognition acknowledgment - thought leadership', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert signals for Sequoia Capital
INSERT INTO "Signal" ("id", "lpId", "summary", "tags", "url", "weight", "createdAt") VALUES
('cls1x001', 'clp1x001', 'Sequoia announces $2.8B new fund focused on AI infrastructure', ARRAY['funding', 'AI', 'infrastructure'], 'https://example.com/sequoia-fund', 2.0, CURRENT_TIMESTAMP),
('cls1x002', 'clp1x001', 'Sarah Chen speaking at TechCrunch Disrupt about future of enterprise software', ARRAY['speaking', 'enterprise', 'thought-leadership'], NULL, 1.5, CURRENT_TIMESTAMP),
('cls1x003', 'clp1x001', 'Sequoia portfolio company exits for $4.2B', ARRAY['acquisition', 'exit', 'success'], NULL, 1.0, CURRENT_TIMESTAMP);

-- Insert signals for a16z
INSERT INTO "Signal" ("id", "lpId", "summary", "tags", "url", "weight", "createdAt") VALUES
('cls1x004', 'clp1x002', 'a16z launches crypto research initiative with MIT', ARRAY['partnership', 'crypto', 'research'], 'https://example.com/a16z-mit', 1.5, CURRENT_TIMESTAMP),
('cls1x005', 'clp1x002', 'Hiring 5 new partners for consumer investments', ARRAY['hiring', 'expansion', 'consumer'], NULL, 1.2, CURRENT_TIMESTAMP);

-- Insert signals for Index Ventures
INSERT INTO "Signal" ("id", "lpId", "summary", "tags", "url", "weight", "createdAt") VALUES
('cls1x006', 'clp1x003', 'Index Ventures opens new office in Berlin', ARRAY['expansion', 'Europe', 'office'], NULL, 1.0, CURRENT_TIMESTAMP),
('cls1x007', 'clp1x003', 'Emma Thompson wins "Best VC" award at European Tech Summit', ARRAY['award', 'recognition', 'Europe'], NULL, 0.8, CURRENT_TIMESTAMP);

-- Insert sample LPs (Limited Partners - investors in VC funds)
INSERT INTO "LP" ("id", "name", "contactName", "email", "geo", "strategy", "score", "messageAngle", "createdAt", "updatedAt") VALUES
('clp1x001', 'CalPERS (California Public Employees Retirement System)', 'Jennifer Martinez', 'jmartinez@calpers.ca.gov', 'USA (California)', ARRAY['Venture Capital', 'Growth Equity', 'Infrastructure'], 6.0, 'Congrats on recent funding - discuss growth opportunities', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clp1x002', 'Yale Endowment', 'David Chen', 'david.chen@yale.edu', 'USA (Connecticut)', ARRAY['Venture Capital', 'Private Equity', 'Absolute Return'], 3.9, 'Build on recent partnership momentum', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clp1x003', 'Ontario Teachers Pension Plan', 'Sarah Thompson', 'sthompson@otpp.com', 'Canada', ARRAY['Venture Capital', 'Growth Equity', 'Public Markets'], 2.3, 'Reference: Expanding venture capital allocation in North America...', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert signals for CalPERS
INSERT INTO "Signal" ("id", "lpId", "summary", "tags", "url", "weight", "createdAt") VALUES
('cls1x001', 'clp1x001', 'CalPERS announces $2.5B increase in venture capital allocation', ARRAY['funding', 'venture-capital', 'allocation'], 'https://example.com/calpers-vc', 2.0, CURRENT_TIMESTAMP),
('cls1x002', 'clp1x001', 'Jennifer Martinez speaking at Institutional Investor Summit about alternative investments', ARRAY['speaking', 'alternatives', 'thought-leadership'], NULL, 1.5, CURRENT_TIMESTAMP),
('cls1x003', 'clp1x001', 'CalPERS reports 15% returns on venture portfolio', ARRAY['performance', 'returns', 'success'], NULL, 1.0, CURRENT_TIMESTAMP);

-- Insert signals for Yale Endowment
INSERT INTO "Signal" ("id", "lpId", "summary", "tags", "url", "weight", "createdAt") VALUES
('cls1x004', 'clp1x002', 'Yale partners with Stanford on emerging manager program', ARRAY['partnership', 'emerging-managers', 'education'], 'https://example.com/yale-stanford', 1.5, CURRENT_TIMESTAMP),
('cls1x005', 'clp1x002', 'Hiring new Senior Investment Associate for VC investments', ARRAY['hiring', 'expansion', 'venture-capital'], NULL, 1.2, CURRENT_TIMESTAMP);

-- Insert signals for Ontario Teachers
INSERT INTO "Signal" ("id", "lpId", "summary", "tags", "url", "weight", "createdAt") VALUES
('cls1x006', 'clp1x003', 'Ontario Teachers expanding venture capital allocation in North America', ARRAY['expansion', 'venture-capital', 'allocation'], NULL, 1.0, CURRENT_TIMESTAMP),
('cls1x007', 'clp1x003', 'Sarah Thompson recognized as top pension fund CIO by Institutional Investor', ARRAY['award', 'recognition', 'leadership'], NULL, 0.8, CURRENT_TIMESTAMP);

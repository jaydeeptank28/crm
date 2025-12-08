-- Test Data for CRM Dashboard Charts
-- Run this in your PostgreSQL database

-- 1. Lead Statuses (for Leads Overview Chart)
INSERT INTO lead_statuses (name, color, created_at, updated_at) VALUES
('New', '#3abaf4', NOW(), NOW()),
('Contacted', '#6777ef', NOW(), NOW()),
('Qualified', '#47c363', NOW(), NOW()),
('Proposal Sent', '#ffa426', NOW(), NOW()),
('Won', '#34c38f', NOW(), NOW()),
('Lost', '#fc544b', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color;

-- 2. Ticket Statuses (for Tickets Status Chart)
INSERT INTO ticket_statuses (name, pick_color, created_at, updated_at) VALUES
('Open', '#6777ef', NOW(), NOW()),
('In Progress', '#ffa426', NOW(), NOW()),
('Answered', '#3abaf4', NOW(), NOW()),
('On Hold', '#fc544b', NOW(), NOW()),
('Closed', '#47c363', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET pick_color = EXCLUDED.pick_color;

-- 3. Create some customers first (needed for invoices, leads, etc.)
INSERT INTO customers (company_name, created_at, updated_at) VALUES
('Acme Corporation', NOW(), NOW()),
('TechStart Inc', NOW(), NOW()),
('Global Solutions', NOW(), NOW()),
('Innovation Labs', NOW(), NOW()),
('Digital Dynamics', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 4. Invoices with different statuses (for Invoice stats and Weekly Payment chart)
-- Status: 0=Draft, 1=Unpaid, 2=Paid, 3=Partially Paid, 4=Cancelled
INSERT INTO invoices (invoice_number, customer_id, payment_status, total_amount, discount_type, discount, adjustment, status, created_at, updated_at) VALUES
-- Drafted invoices
('INV-TEST-001', 1, 0, 500.00, 0, 0, 0, 1, NOW() - INTERVAL '2 days', NOW()),
('INV-TEST-002', 2, 0, 750.00, 0, 0, 0, 1, NOW() - INTERVAL '3 days', NOW()),
-- Unpaid invoices
('INV-TEST-003', 3, 1, 1200.00, 0, 0, 0, 1, NOW() - INTERVAL '1 day', NOW()),
('INV-TEST-004', 4, 1, 800.00, 0, 0, 0, 1, NOW() - INTERVAL '4 days', NOW()),
('INV-TEST-005', 5, 1, 950.00, 0, 0, 0, 1, NOW() - INTERVAL '5 days', NOW()),
-- Paid invoices (for weekly chart)
('INV-TEST-006', 1, 2, 2500.00, 0, 0, 0, 1, NOW(), NOW()),  -- Today
('INV-TEST-007', 2, 2, 1800.00, 0, 0, 0, 1, NOW() - INTERVAL '1 day', NOW()),
('INV-TEST-008', 3, 2, 3200.00, 0, 0, 0, 1, NOW() - INTERVAL '2 days', NOW()),
('INV-TEST-009', 4, 2, 1500.00, 0, 0, 0, 1, NOW() - INTERVAL '3 days', NOW()),
('INV-TEST-010', 5, 2, 2100.00, 0, 0, 0, 1, NOW() - INTERVAL '7 days', NOW()),  -- Last week
('INV-TEST-011', 1, 2, 1900.00, 0, 0, 0, 1, NOW() - INTERVAL '8 days', NOW()),
('INV-TEST-012', 2, 2, 2800.00, 0, 0, 0, 1, NOW() - INTERVAL '9 days', NOW()),
-- Partially paid
('INV-TEST-013', 3, 3, 1600.00, 0, 0, 0, 1, NOW() - INTERVAL '6 days', NOW()),
('INV-TEST-014', 4, 3, 1100.00, 0, 0, 0, 1, NOW() - INTERVAL '10 days', NOW()),
-- Cancelled
('INV-TEST-015', 5, 4, 400.00, 0, 0, 0, 1, NOW() - INTERVAL '15 days', NOW())
ON CONFLICT DO NOTHING;

-- 5. Projects with different statuses
-- Status: 0=Not Started, 1=In Progress, 2=On Hold, 3=Cancelled, 4=Finished
INSERT INTO projects (project_name, customer_id, status, progress, billing_type, start_date, deadline, created_at, updated_at) VALUES
('Website Redesign', 1, 0, 0, 1, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW()),
('Mobile App Development', 2, 0, 0, 1, NOW(), NOW() + INTERVAL '60 days', NOW(), NOW()),
('CRM Integration', 3, 1, 35, 1, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', NOW(), NOW()),
('API Development', 4, 1, 60, 1, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days', NOW(), NOW()),
('Database Migration', 5, 1, 80, 1, NOW() - INTERVAL '30 days', NOW() + INTERVAL '5 days', NOW(), NOW()),
('Security Audit', 1, 2, 25, 1, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW(), NOW()),
('Legacy System Update', 2, 3, 15, 1, NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', NOW(), NOW()),
('E-commerce Platform', 3, 4, 100, 1, NOW() - INTERVAL '60 days', NOW() - INTERVAL '5 days', NOW(), NOW()),
('Dashboard Analytics', 4, 4, 100, 1, NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days', NOW(), NOW()),
('Payment Gateway', 5, 4, 100, 1, NOW() - INTERVAL '50 days', NOW() - INTERVAL '20 days', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 6. Proposals with different statuses
-- Status: 0=Draft, 1=Open, 2=Revised, 3=Declined, 4=Accepted
INSERT INTO proposals (subject, customer_id, status, total_amount, discount_type, discount, open_till, created_at, updated_at) VALUES
('Website Development Proposal', 1, 0, 5000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Mobile App Proposal', 2, 1, 8000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Cloud Migration Proposal', 3, 1, 12000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Security Services Proposal', 4, 2, 6500.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Maintenance Contract Proposal', 5, 3, 3000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Enterprise Solution Proposal', 1, 4, 25000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Consulting Services Proposal', 2, 4, 15000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Training Program Proposal', 3, 4, 4500.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 7. Estimates with different statuses
-- Status: 0=Draft, 1=Sent, 2=Declined, 3=Accepted, 4=Expired
INSERT INTO estimates (title, customer_id, status, total_amount, discount_type, discount, valid_till, created_at, updated_at) VALUES
('Website Estimate', 1, 0, 3500.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('App Development Estimate', 2, 1, 7500.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Server Setup Estimate', 3, 1, 2000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Integration Estimate', 4, 2, 4500.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Custom CRM Estimate', 5, 3, 18000.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Analytics Estimate', 1, 3, 5500.00, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW()),
('Old Estimate', 2, 4, 2500.00, 0, 0, NOW() - INTERVAL '10 days', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 8. Leads (distributed across lead statuses)
INSERT INTO leads (name, email, phone, company, lead_status_id, created_at, updated_at)
SELECT 
    'Lead ' || i,
    'lead' || i || '@example.com',
    '555-' || LPAD(i::text, 4, '0'),
    'Company ' || i,
    ((i - 1) % 6) + 1,
    NOW() - (i || ' days')::INTERVAL,
    NOW()
FROM generate_series(1, 24) AS i
ON CONFLICT DO NOTHING;

-- 9. Tickets (distributed across ticket statuses)
INSERT INTO tickets (subject, status_id, priority_id, customer_id, department_id, created_at, updated_at)
SELECT 
    'Support Ticket ' || i,
    ((i - 1) % 5) + 1,
    ((i - 1) % 3) + 1,
    ((i - 1) % 5) + 1,
    1,
    NOW() - (i || ' days')::INTERVAL,
    NOW()
FROM generate_series(1, 20) AS i
ON CONFLICT DO NOTHING;

-- 10. Expenses (for Income vs Expenses chart - monthly distribution)
INSERT INTO expenses (name, amount, category_id, expense_date, currency, created_at, updated_at) VALUES
('Office Rent - Jan', 2500.00, 1, '2025-01-15', 'USD', '2025-01-15', '2025-01-15'),
('Office Rent - Feb', 2500.00, 1, '2025-02-15', 'USD', '2025-02-15', '2025-02-15'),
('Office Rent - Mar', 2500.00, 1, '2025-03-15', 'USD', '2025-03-15', '2025-03-15'),
('Office Rent - Apr', 2500.00, 1, '2025-04-15', 'USD', '2025-04-15', '2025-04-15'),
('Office Rent - May', 2500.00, 1, '2025-05-15', 'USD', '2025-05-15', '2025-05-15'),
('Office Rent - Jun', 2500.00, 1, '2025-06-15', 'USD', '2025-06-15', '2025-06-15'),
('Office Rent - Jul', 2500.00, 1, '2025-07-15', 'USD', '2025-07-15', '2025-07-15'),
('Office Rent - Aug', 2500.00, 1, '2025-08-15', 'USD', '2025-08-15', '2025-08-15'),
('Office Rent - Sep', 2500.00, 1, '2025-09-15', 'USD', '2025-09-15', '2025-09-15'),
('Office Rent - Oct', 2500.00, 1, '2025-10-15', 'USD', '2025-10-15', '2025-10-15'),
('Office Rent - Nov', 2500.00, 1, '2025-11-15', 'USD', '2025-11-15', '2025-11-15'),
('Office Rent - Dec', 2500.00, 1, '2025-12-15', 'USD', '2025-12-15', '2025-12-15'),
('Utilities - Dec', 500.00, 1, NOW() - INTERVAL '5 days', 'USD', NOW(), NOW()),
('Software Subscriptions', 800.00, 1, NOW() - INTERVAL '10 days', 'USD', NOW(), NOW()),
('Marketing Expenses', 1200.00, 1, NOW() - INTERVAL '15 days', 'USD', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 11. Contracts (expiring this month for table)
INSERT INTO contracts (subject, customer_id, start_date, end_date, contract_value, contract_type_id, created_at, updated_at) VALUES
('Annual Support Contract', 1, NOW() - INTERVAL '6 months', NOW() + INTERVAL '5 days', 12000.00, 1, NOW(), NOW()),
('Maintenance Agreement', 2, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 days', 8500.00, 1, NOW(), NOW()),
('Consulting Retainer', 3, NOW() - INTERVAL '3 months', NOW() + INTERVAL '15 days', 15000.00, 1, NOW(), NOW()),
('SLA Contract', 4, NOW() - INTERVAL '11 months', NOW() + INTERVAL '20 days', 24000.00, 1, NOW(), NOW()),
('Development Contract', 5, NOW() - INTERVAL '4 months', NOW() + INTERVAL '25 days', 50000.00, 1, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Show summary
SELECT 'Lead Statuses' as entity, COUNT(*) as count FROM lead_statuses
UNION ALL
SELECT 'Ticket Statuses', COUNT(*) FROM ticket_statuses
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Proposals', COUNT(*) FROM proposals
UNION ALL
SELECT 'Estimates', COUNT(*) FROM estimates
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads
UNION ALL
SELECT 'Tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Contracts', COUNT(*) FROM contracts;

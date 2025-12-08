/**
 * Seed test data using RAW SQL - bypasses model definitions
 * Run with: node scripts/seedRawData.js
 */

import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function seedRawData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Get existing status IDs from the database
        console.log('\n📊 Getting existing status IDs...');

        const leadStatuses = await sequelize.query(
            'SELECT id, name FROM lead_statuses ORDER BY id LIMIT 6',
            { type: QueryTypes.SELECT }
        );
        console.log('Lead statuses found:', leadStatuses.length);

        const ticketStatuses = await sequelize.query(
            'SELECT id, name FROM ticket_statuses ORDER BY id LIMIT 5',
            { type: QueryTypes.SELECT }
        );
        console.log('Ticket statuses found:', ticketStatuses.length);

        // Get or create a customer
        let customerId = 1;
        const customers = await sequelize.query(
            'SELECT id FROM customers LIMIT 1',
            { type: QueryTypes.SELECT }
        );
        if (customers.length > 0) {
            customerId = customers[0].id;
        } else {
            await sequelize.query(
                `INSERT INTO customers (company_name, created_at, updated_at) VALUES ('Test Company', NOW(), NOW())`,
                { type: QueryTypes.INSERT }
            );
            const newCustomers = await sequelize.query('SELECT id FROM customers LIMIT 1', { type: QueryTypes.SELECT });
            if (newCustomers.length > 0) customerId = newCustomers[0].id;
        }
        console.log('Using customer ID:', customerId);

        // 1. Insert Invoices with different statuses
        console.log('\n💰 Inserting Invoices...');
        const invoiceStatuses = [
            { status: 0, count: 3 },   // Drafted
            { status: 1, count: 5 },   // Unpaid
            { status: 2, count: 8 },   // Paid
            { status: 3, count: 4 },   // Partially Paid
            { status: 4, count: 2 }    // Cancelled
        ];

        let invoiceNum = 9000;
        for (const inv of invoiceStatuses) {
            for (let i = 0; i < inv.count; i++) {
                invoiceNum++;
                const daysAgo = Math.floor(Math.random() * 14);
                try {
                    await sequelize.query(`
                        INSERT INTO invoices (invoice_number, customer_id, payment_status, total_amount, discount_type, discount, adjustment, status, created_at, updated_at)
                        VALUES ($1, $2, $3, $4, 0, 0, 0, 1, NOW() - INTERVAL '${daysAgo} days', NOW())
                    `, {
                        bind: [`INV-TEST-${invoiceNum}`, customerId, inv.status, 500 + Math.random() * 3000],
                        type: QueryTypes.INSERT
                    });
                } catch (e) { /* ignore duplicates */ }
            }
        }
        const invoiceCount = await sequelize.query('SELECT COUNT(*) as count FROM invoices', { type: QueryTypes.SELECT });
        console.log('   ✓ Invoices total:', invoiceCount[0].count);

        // 2. Insert Leads with different statuses
        console.log('\n📞 Inserting Leads...');
        if (leadStatuses.length > 0) {
            for (let i = 0; i < 24; i++) {
                const statusId = leadStatuses[i % leadStatuses.length].id;
                try {
                    await sequelize.query(`
                        INSERT INTO leads (name, status_id, source_id, company_name, created_at, updated_at)
                        VALUES ($1, $2, 1, $3, NOW() - INTERVAL '${i} days', NOW())
                    `, {
                        bind: [`Test Lead ${Date.now()}-${i}`, statusId, `Test Company ${i}`],
                        type: QueryTypes.INSERT
                    });
                } catch (e) {
                    console.log('Lead insert error:', e.message);
                }
            }
        }
        const leadCount = await sequelize.query('SELECT COUNT(*) as count FROM leads', { type: QueryTypes.SELECT });
        console.log('   ✓ Leads total:', leadCount[0].count);

        // 3. Insert Tickets with different statuses
        console.log('\n🎫 Inserting Tickets...');
        if (ticketStatuses.length > 0) {
            for (let i = 0; i < 20; i++) {
                const statusId = ticketStatuses[i % ticketStatuses.length].id;
                try {
                    await sequelize.query(`
                        INSERT INTO tickets (subject, ticket_status_id, priority_id, created_at, updated_at)
                        VALUES ($1, $2, $3, NOW() - INTERVAL '${i} days', NOW())
                    `, {
                        bind: [`Test Ticket ${Date.now()}-${i}`, statusId, (i % 3) + 1],
                        type: QueryTypes.INSERT
                    });
                } catch (e) {
                    console.log('Ticket insert error:', e.message);
                }
            }
        }
        const ticketCount = await sequelize.query('SELECT COUNT(*) as count FROM tickets', { type: QueryTypes.SELECT });
        console.log('   ✓ Tickets total:', ticketCount[0].count);

        // 4. Insert Projects with different statuses
        console.log('\n📁 Inserting Projects...');
        const projectStatuses = [0, 0, 1, 1, 1, 2, 3, 4, 4, 4];
        for (let i = 0; i < projectStatuses.length; i++) {
            try {
                await sequelize.query(`
                    INSERT INTO projects (project_name, customer_id, status, progress, billing_type, start_date, deadline, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, 1, NOW(), NOW() + INTERVAL '30 days', NOW(), NOW())
                `, {
                    bind: [`Test Project ${Date.now()}-${i}`, customerId, projectStatuses[i], Math.floor(Math.random() * 100)],
                    type: QueryTypes.INSERT
                });
            } catch (e) {
                console.log('Project insert error:', e.message);
            }
        }
        const projectCount = await sequelize.query('SELECT COUNT(*) as count FROM projects', { type: QueryTypes.SELECT });
        console.log('   ✓ Projects total:', projectCount[0].count);

        // 5. Insert Proposals
        console.log('\n📜 Inserting Proposals...');
        const proposalStatuses = [0, 1, 1, 2, 3, 4, 4, 4];
        for (let i = 0; i < proposalStatuses.length; i++) {
            try {
                await sequelize.query(`
                    INSERT INTO proposals (subject, customer_id, status, total_amount, discount_type, discount, open_till, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW())
                `, {
                    bind: [`Test Proposal ${Date.now()}-${i}`, customerId, proposalStatuses[i], 5000 + Math.random() * 20000],
                    type: QueryTypes.INSERT
                });
            } catch (e) {
                console.log('Proposal insert error:', e.message);
            }
        }
        const proposalCount = await sequelize.query('SELECT COUNT(*) as count FROM proposals', { type: QueryTypes.SELECT });
        console.log('   ✓ Proposals total:', proposalCount[0].count);

        // 6. Insert Estimates
        console.log('\n📊 Inserting Estimates...');
        const estimateStatuses = [0, 1, 1, 2, 3, 3, 4];
        for (let i = 0; i < estimateStatuses.length; i++) {
            try {
                await sequelize.query(`
                    INSERT INTO estimates (title, customer_id, status, total_amount, discount_type, discount, valid_till, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, 0, 0, NOW() + INTERVAL '30 days', NOW(), NOW())
                `, {
                    bind: [`Test Estimate ${Date.now()}-${i}`, customerId, estimateStatuses[i], 3000 + Math.random() * 15000],
                    type: QueryTypes.INSERT
                });
            } catch (e) {
                console.log('Estimate insert error:', e.message);
            }
        }
        const estimateCount = await sequelize.query('SELECT COUNT(*) as count FROM estimates', { type: QueryTypes.SELECT });
        console.log('   ✓ Estimates total:', estimateCount[0].count);

        // Summary
        console.log('\n✅ Test data seeding complete!');
        console.log('\n📊 Final Counts:');
        console.log(`   Invoices: ${invoiceCount[0].count}`);
        console.log(`   Leads: ${leadCount[0].count}`);
        console.log(`   Tickets: ${ticketCount[0].count}`);
        console.log(`   Projects: ${projectCount[0].count}`);
        console.log(`   Proposals: ${proposalCount[0].count}`);
        console.log(`   Estimates: ${estimateCount[0].count}`);

        await sequelize.close();
        console.log('\n🎉 Done! Refresh your dashboard to see the charts.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedRawData();

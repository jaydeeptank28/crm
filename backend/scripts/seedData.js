/**
 * Seed test data using Sequelize models directly
 * Run with: node scripts/seedData.js
 */

import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

// Import models
import Invoice from '../src/models/Invoice.js';
import Project from '../src/models/Project.js';
import Proposal from '../src/models/Proposal.js';
import Estimate from '../src/models/Estimate.js';
import Lead from '../src/models/Lead.js';
import LeadStatus from '../src/models/LeadStatus.js';
import Ticket from '../src/models/Ticket.js';
import TicketStatus from '../src/models/TicketStatus.js';
import Customer from '../src/models/Customer.js';
import Expense from '../src/models/Expense.js';
import Contract from '../src/models/Contract.js';

async function seedData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // 1. Lead Statuses
        console.log('\n📊 Seeding Lead Statuses...');
        const leadStatusData = [
            { name: 'New', color: '#3abaf4' },
            { name: 'Contacted', color: '#6777ef' },
            { name: 'Qualified', color: '#47c363' },
            { name: 'Proposal Sent', color: '#ffa426' },
            { name: 'Won', color: '#34c38f' },
            { name: 'Lost', color: '#fc544b' }
        ];
        for (const data of leadStatusData) {
            try {
                await LeadStatus.findOrCreate({ where: { name: data.name }, defaults: data });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Lead statuses ready');

        // 2. Ticket Statuses
        console.log('\n📊 Seeding Ticket Statuses...');
        const ticketStatusData = [
            { name: 'Open', pick_color: '#6777ef' },
            { name: 'In Progress', pick_color: '#ffa426' },
            { name: 'Answered', pick_color: '#3abaf4' },
            { name: 'On Hold', pick_color: '#fc544b' },
            { name: 'Closed', pick_color: '#47c363' }
        ];
        for (const data of ticketStatusData) {
            try {
                await TicketStatus.findOrCreate({ where: { name: data.name }, defaults: data });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Ticket statuses ready');

        // 3. Customers
        console.log('\n👥 Seeding Customers...');
        const customerData = [
            { company_name: 'Acme Corporation' },
            { company_name: 'TechStart Inc' },
            { company_name: 'Global Solutions' },
            { company_name: 'Innovation Labs' },
            { company_name: 'Digital Dynamics' }
        ];
        for (const data of customerData) {
            try {
                await Customer.findOrCreate({ where: { company_name: data.company_name }, defaults: data });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Customers ready');

        // Get IDs for foreign keys
        const leadStatuses = await LeadStatus.findAll();
        const ticketStatuses = await TicketStatus.findAll();

        // 4. Invoices (using only model-defined columns)
        console.log('\n💰 Seeding Invoices...');
        const today = new Date();
        for (let i = 0; i < 15; i++) {
            const status = i < 2 ? 0 : i < 5 ? 1 : i < 12 ? 2 : i < 14 ? 3 : 4;
            const amount = 500 + (i * 200);
            const createdDate = new Date(today);
            createdDate.setDate(createdDate.getDate() - i);

            try {
                await Invoice.create({
                    payment_status: status,
                    total_amount: amount,
                    created_at: createdDate
                });
            } catch (e) { /* ignore duplicates */ }
        }
        console.log('   ✓ Invoices added');

        // 5. Projects
        console.log('\n📁 Seeding Projects...');
        const projectStatuses = [0, 0, 1, 1, 1, 2, 3, 4, 4, 4];
        for (let i = 0; i < 10; i++) {
            try {
                await Project.create({
                    status: projectStatuses[i]
                });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Projects added');

        // 6. Proposals
        console.log('\n📜 Seeding Proposals...');
        const proposalStatuses = [0, 1, 1, 2, 3, 4, 4, 4];
        for (let i = 0; i < 8; i++) {
            try {
                await Proposal.create({
                    status: proposalStatuses[i]
                });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Proposals added');

        // 7. Estimates
        console.log('\n📊 Seeding Estimates...');
        const estimateStatuses = [0, 1, 1, 2, 3, 3, 4];
        for (let i = 0; i < 7; i++) {
            try {
                await Estimate.create({
                    status: estimateStatuses[i]
                });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Estimates added');

        // 8. Leads
        console.log('\n📞 Seeding Leads...');
        for (let i = 0; i < 24; i++) {
            const statusId = leadStatuses[i % leadStatuses.length]?.id || 1;
            try {
                await Lead.create({
                    status_id: statusId
                });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Leads added');

        // 9. Tickets
        console.log('\n🎫 Seeding Tickets...');
        for (let i = 0; i < 20; i++) {
            const statusId = ticketStatuses[i % ticketStatuses.length]?.id || 1;
            try {
                await Ticket.create({
                    ticket_status_id: statusId
                });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Tickets added');

        // 10. Expenses
        console.log('\n💸 Seeding Expenses...');
        for (let i = 0; i < 12; i++) {
            try {
                await Expense.create({
                    amount: 2500 + (i * 100)
                });
            } catch (e) { /* ignore */ }
        }
        console.log('   ✓ Expenses added');

        // Summary
        console.log('\n✅ Test data seeding complete!');
        console.log('\n📊 Current Counts:');
        console.log(`   Lead Statuses: ${await LeadStatus.count()}`);
        console.log(`   Ticket Statuses: ${await TicketStatus.count()}`);
        console.log(`   Customers: ${await Customer.count()}`);
        console.log(`   Invoices: ${await Invoice.count()}`);
        console.log(`   Projects: ${await Project.count()}`);
        console.log(`   Proposals: ${await Proposal.count()}`);
        console.log(`   Estimates: ${await Estimate.count()}`);
        console.log(`   Leads: ${await Lead.count()}`);
        console.log(`   Tickets: ${await Ticket.count()}`);
        console.log(`   Expenses: ${await Expense.count()}`);

        await sequelize.close();
        console.log('\n🎉 Done! Refresh your dashboard to see the charts.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedData();

/**
 * Seed script to insert test data for dashboard charts and statistics
 * Run with: node scripts/seedTestData.js
 */

import sequelize from '../src/config/database.js';

// Import all models
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

async function seedTestData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // 1. Seed Lead Statuses (for chart)
        console.log('\n📊 Seeding Lead Statuses...');
        const leadStatuses = [
            { name: 'New', color: '#3abaf4', order: 1 },
            { name: 'Contacted', color: '#6777ef', order: 2 },
            { name: 'Qualified', color: '#47c363', order: 3 },
            { name: 'Proposal Sent', color: '#ffa426', order: 4 },
            { name: 'Won', color: '#34c38f', order: 5 },
            { name: 'Lost', color: '#fc544b', order: 6 },
        ];

        for (const status of leadStatuses) {
            await LeadStatus.findOrCreate({
                where: { name: status.name },
                defaults: status
            });
        }
        console.log('   ✓ Lead statuses created');

        // 2. Seed Ticket Statuses (for chart)
        console.log('\n📊 Seeding Ticket Statuses...');
        const ticketStatuses = [
            { name: 'Open', pick_color: '#6777ef', is_default: true, order: 1 },
            { name: 'In Progress', pick_color: '#ffa426', is_default: false, order: 2 },
            { name: 'Answered', pick_color: '#3abaf4', is_default: false, order: 3 },
            { name: 'On Hold', pick_color: '#fc544b', is_default: false, order: 4 },
            { name: 'Closed', pick_color: '#47c363', is_default: false, order: 5 },
        ];

        for (const status of ticketStatuses) {
            await TicketStatus.findOrCreate({
                where: { name: status.name },
                defaults: status
            });
        }
        console.log('   ✓ Ticket statuses created');

        // Get status IDs for leads and tickets
        const allLeadStatuses = await LeadStatus.findAll();
        const allTicketStatuses = await TicketStatus.findAll();

        // 3. Seed Customers
        console.log('\n👥 Seeding Customers...');
        const customers = [];
        for (let i = 1; i <= 15; i++) {
            const [customer] = await Customer.findOrCreate({
                where: { email: `customer${i}@example.com` },
                defaults: {
                    company_name: `Company ${i}`,
                    email: `customer${i}@example.com`,
                    phone: `555-000-${String(i).padStart(4, '0')}`,
                    website: `https://company${i}.com`,
                    is_active: i % 10 !== 0 // 90% active
                }
            });
            customers.push(customer);
        }
        console.log(`   ✓ ${customers.length} customers created`);

        // 4. Seed Invoices (different statuses for pie chart)
        console.log('\n💰 Seeding Invoices...');
        const invoiceData = [
            // Drafted (0)
            ...Array(3).fill(null).map((_, i) => ({ payment_status: Invoice.STATUS_DRAFT, total_amount: 500 + i * 100 })),
            // Unpaid (1)
            ...Array(5).fill(null).map((_, i) => ({ payment_status: Invoice.STATUS_UNPAID, total_amount: 1000 + i * 200 })),
            // Paid (2) - Most for weekly chart
            ...Array(8).fill(null).map((_, i) => ({ payment_status: Invoice.STATUS_PAID, total_amount: 1500 + i * 300 })),
            // Partially Paid (3)
            ...Array(4).fill(null).map((_, i) => ({ payment_status: Invoice.STATUS_PARTIALLY_PAID, total_amount: 800 + i * 150 })),
            // Cancelled (4)
            ...Array(2).fill(null).map((_, i) => ({ payment_status: Invoice.STATUS_CANCELLED, total_amount: 200 + i * 50 })),
        ];

        // Create invoices with different dates for weekly chart
        const today = new Date();
        for (let i = 0; i < invoiceData.length; i++) {
            const data = invoiceData[i];
            const daysAgo = i % 14; // Spread across 2 weeks
            const createdDate = new Date(today);
            createdDate.setDate(createdDate.getDate() - daysAgo);

            await Invoice.findOrCreate({
                where: { invoice_number: `INV-${String(1000 + i).padStart(5, '0')}` },
                defaults: {
                    invoice_number: `INV-${String(1000 + i).padStart(5, '0')}`,
                    customer_id: customers[i % customers.length].id,
                    payment_status: data.payment_status,
                    total_amount: data.total_amount,
                    discount_type: 0,
                    discount: 0,
                    adjustment: 0,
                    status: 1,
                    created_at: createdDate,
                    updated_at: createdDate
                }
            });
        }
        console.log(`   ✓ ${invoiceData.length} invoices created`);

        // 5. Seed Projects (different statuses)
        console.log('\n📁 Seeding Projects...');
        const projectData = [
            ...Array(3).fill(null).map(() => ({ status: Project.STATUS_NOT_STARTED })),
            ...Array(5).fill(null).map(() => ({ status: Project.STATUS_IN_PROGRESS })),
            ...Array(2).fill(null).map(() => ({ status: Project.STATUS_ON_HOLD })),
            ...Array(1).fill(null).map(() => ({ status: Project.STATUS_CANCELLED })),
            ...Array(6).fill(null).map(() => ({ status: Project.STATUS_FINISHED })),
        ];

        for (let i = 0; i < projectData.length; i++) {
            await Project.findOrCreate({
                where: { project_name: `Project ${i + 1}` },
                defaults: {
                    project_name: `Project ${i + 1}`,
                    customer_id: customers[i % customers.length].id,
                    status: projectData[i].status,
                    progress: Math.floor(Math.random() * 100),
                    billing_type: 1,
                    start_date: new Date(),
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
        }
        console.log(`   ✓ ${projectData.length} projects created`);

        // 6. Seed Proposals
        console.log('\n📜 Seeding Proposals...');
        const proposalData = [
            ...Array(2).fill(null).map(() => ({ status: Proposal.STATUS_DRAFT })),
            ...Array(4).fill(null).map(() => ({ status: Proposal.STATUS_OPEN })),
            ...Array(2).fill(null).map(() => ({ status: Proposal.STATUS_REVISED })),
            ...Array(5).fill(null).map(() => ({ status: Proposal.STATUS_ACCEPTED })),
            ...Array(1).fill(null).map(() => ({ status: Proposal.STATUS_DECLINED })),
        ];

        for (let i = 0; i < proposalData.length; i++) {
            await Proposal.findOrCreate({
                where: { subject: `Proposal ${i + 1}` },
                defaults: {
                    subject: `Proposal ${i + 1}`,
                    customer_id: customers[i % customers.length].id,
                    status: proposalData[i].status,
                    total_amount: 5000 + i * 500,
                    discount_type: 0,
                    discount: 0,
                    open_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
        }
        console.log(`   ✓ ${proposalData.length} proposals created`);

        // 7. Seed Estimates
        console.log('\n📊 Seeding Estimates...');
        const estimateData = [
            ...Array(2).fill(null).map(() => ({ status: Estimate.STATUS_DRAFT })),
            ...Array(3).fill(null).map(() => ({ status: Estimate.STATUS_SENT })),
            ...Array(4).fill(null).map(() => ({ status: Estimate.STATUS_ACCEPTED })),
            ...Array(2).fill(null).map(() => ({ status: Estimate.STATUS_DECLINED })),
            ...Array(1).fill(null).map(() => ({ status: Estimate.STATUS_EXPIRED })),
        ];

        for (let i = 0; i < estimateData.length; i++) {
            await Estimate.findOrCreate({
                where: { title: `Estimate ${i + 1}` },
                defaults: {
                    title: `Estimate ${i + 1}`,
                    customer_id: customers[i % customers.length].id,
                    status: estimateData[i].status,
                    total_amount: 3000 + i * 400,
                    discount_type: 0,
                    discount: 0,
                    valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });
        }
        console.log(`   ✓ ${estimateData.length} estimates created`);

        // 8. Seed Leads (with different statuses for chart)
        console.log('\n📞 Seeding Leads...');
        for (let i = 0; i < 20; i++) {
            const statusId = allLeadStatuses[i % allLeadStatuses.length].id;
            await Lead.findOrCreate({
                where: { email: `lead${i + 1}@example.com` },
                defaults: {
                    name: `Lead ${i + 1}`,
                    email: `lead${i + 1}@example.com`,
                    phone: `555-100-${String(i).padStart(4, '0')}`,
                    status_id: statusId,
                    source_id: 1,
                    company: `Lead Company ${i + 1}`
                }
            });
        }
        console.log('   ✓ 20 leads created');

        // 9. Seed Tickets (with different statuses for chart)
        console.log('\n🎫 Seeding Tickets...');
        for (let i = 0; i < 15; i++) {
            const statusId = allTicketStatuses[i % allTicketStatuses.length].id;
            await Ticket.findOrCreate({
                where: { subject: `Ticket ${i + 1}` },
                defaults: {
                    subject: `Ticket ${i + 1}`,
                    status_id: statusId,
                    priority_id: (i % 3) + 1,
                    customer_id: customers[i % customers.length].id,
                    department_id: 1
                }
            });
        }
        console.log('   ✓ 15 tickets created');

        // 10. Seed Expenses (for Income vs Expense chart)
        console.log('\n💸 Seeding Expenses...');
        for (let i = 0; i < 12; i++) {
            const expenseDate = new Date();
            expenseDate.setMonth(expenseDate.getMonth() - i);

            await Expense.findOrCreate({
                where: { name: `Expense Month ${12 - i}` },
                defaults: {
                    name: `Expense Month ${12 - i}`,
                    amount: 500 + Math.floor(Math.random() * 1500),
                    category_id: 1,
                    expense_date: expenseDate,
                    currency: 'USD'
                }
            });
        }
        console.log('   ✓ 12 expenses created (one per month)');

        // 11. Seed Contracts (some expiring this month)
        console.log('\n📋 Seeding Contracts...');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        for (let i = 0; i < 8; i++) {
            const endDate = new Date(currentYear, currentMonth, 10 + i * 2); // Spread across month
            const startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 6);

            await Contract.findOrCreate({
                where: { subject: `Contract ${i + 1}` },
                defaults: {
                    subject: `Contract ${i + 1}`,
                    customer_id: customers[i % customers.length].id,
                    start_date: startDate,
                    end_date: endDate,
                    contract_value: 10000 + i * 2000,
                    contract_type_id: 1
                }
            });
        }
        console.log('   ✓ 8 contracts created (expiring this month)');

        console.log('\n✅ All test data seeded successfully!');
        console.log('\n📊 Summary:');
        console.log('   - Lead Statuses: 6');
        console.log('   - Ticket Statuses: 5');
        console.log('   - Customers: 15');
        console.log('   - Invoices: 22');
        console.log('   - Projects: 17');
        console.log('   - Proposals: 14');
        console.log('   - Estimates: 12');
        console.log('   - Leads: 20');
        console.log('   - Tickets: 15');
        console.log('   - Expenses: 12');
        console.log('   - Contracts: 8');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedTestData();

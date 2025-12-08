/**
 * Dashboard Controller - 100% Replication of Laravel DashboardController.php
 * 
 * Endpoints:
 * - GET /api/dashboard/stats - All dashboard statistics
 * - GET /api/dashboard/contracts/filter - Contract month filter (contractMonthFilter)
 */

import Invoice from '../models/Invoice.js';
import Project from '../models/Project.js';
import Proposal from '../models/Proposal.js';
import Estimate from '../models/Estimate.js';
import Lead from '../models/Lead.js';
import LeadStatus from '../models/LeadStatus.js';
import Ticket from '../models/Ticket.js';
import TicketStatus from '../models/TicketStatus.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Contract from '../models/Contract.js';
import sequelize from '../config/database.js';
import { Op, Sequelize, QueryTypes } from 'sequelize';

/**
 * Get all dashboard stats
 * Replicates DashboardController@index
 */
export const getDashboardStats = async (req, res) => {
    try {
        // 1. Invoice Status Counts - matches $this->invoiceRepository->getInvoicesStatusCount()
        const invoices = await Invoice.findAll();
        const invoiceStatusCount = {
            drafted: invoices.filter(i => i.payment_status === Invoice.STATUS_DRAFT).length,
            unpaid: invoices.filter(i => i.payment_status === Invoice.STATUS_UNPAID).length,
            partially_paid: invoices.filter(i => i.payment_status === Invoice.STATUS_PARTIALLY_PAID).length,
            paid: invoices.filter(i => i.payment_status === Invoice.STATUS_PAID).length,
            cancelled: invoices.filter(i => i.payment_status === Invoice.STATUS_CANCELLED).length,
            total_invoices: invoices.length
        };

        // 2. Proposal Status Counts - matches $this->proposalRepository->getProposalsStatusCount()
        const proposals = await Proposal.findAll();
        const proposalStatusCount = {
            drafted: proposals.filter(p => p.status === Proposal.STATUS_DRAFT).length,
            open: proposals.filter(p => p.status === Proposal.STATUS_OPEN).length,
            revised: proposals.filter(p => p.status === Proposal.STATUS_REVISED).length,
            declined: proposals.filter(p => p.status === Proposal.STATUS_DECLINED).length,
            accepted: proposals.filter(p => p.status === Proposal.STATUS_ACCEPTED).length,
            total_proposals: proposals.length
        };

        // 3. Estimate Status Counts - matches $this->estimateRepository->getEstimatesStatusCount()
        const estimates = await Estimate.findAll();
        const estimateStatusCount = {
            drafted: estimates.filter(e => e.status === Estimate.STATUS_DRAFT).length,
            sent: estimates.filter(e => e.status === Estimate.STATUS_SENT).length,
            expired: estimates.filter(e => e.status === Estimate.STATUS_EXPIRED).length,
            declined: estimates.filter(e => e.status === Estimate.STATUS_DECLINED).length,
            accepted: estimates.filter(e => e.status === Estimate.STATUS_ACCEPTED).length,
            total_estimates: estimates.length
        };

        // 4. Project Status Counts - matches $this->projectRepository->getProjectsStatusCount()
        const projects = await Project.findAll();
        const projectStatusCount = {
            not_started: projects.filter(p => p.status === Project.STATUS_NOT_STARTED).length,
            in_progress: projects.filter(p => p.status === Project.STATUS_IN_PROGRESS).length,
            on_hold: projects.filter(p => p.status === Project.STATUS_ON_HOLD).length,
            cancelled: projects.filter(p => p.status === Project.STATUS_CANCELLED).length,
            finished: projects.filter(p => p.status === Project.STATUS_FINISHED).length,
            total_projects: projects.length
        };

        // 5. Customer & Member Counts
        // Matches $this->customerRepository->customerCount()
        const total_customers = await Customer.count();
        const customerCount = { total_customers };

        // Matches $this->memberRepository->memberCount()
        // Laravel: User::selectRaw('count(case when is_enable = 1 then 1 end) as active_members')
        //              ->selectRaw('count(case when is_enable = 0 then 1 end) as deactive_members')
        //              ->selectRaw('count(*) as total_members')
        //              ->where('owner_id', '=', null)->where('owner_type', '=', null)->first()
        const memberCountResult = await User.findAll({
            where: { owner_id: null, owner_type: null },
            attributes: [
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_enable = true THEN 1 END")), 'active_members'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN is_enable = false THEN 1 END")), 'deactive_members'],
                [sequelize.fn('COUNT', '*'), 'total_members']
            ],
            raw: true
        });
        const memberCount = memberCountResult[0] || { active_members: 0, deactive_members: 0, total_members: 0 };

        // 6. Lead Statuses - LeadStatus::withCount('leads')->get()
        let leadStatusData = [];
        try {
            leadStatusData = await sequelize.query(`
                SELECT ls.id, ls.name, ls.color, COUNT(l.id) as leads_count 
                FROM lead_statuses ls
                LEFT JOIN leads l ON l.status_id = ls.id
                GROUP BY ls.id, ls.name, ls.color
                ORDER BY ls.id
            `, { type: QueryTypes.SELECT });
        } catch (err) {
            console.log('Lead status query error:', err.message);
            const leadStatuses = await LeadStatus.findAll();
            leadStatusData = await Promise.all(leadStatuses.map(async (status) => {
                const count = await Lead.count({ where: { status_id: status.id } });
                return { ...status.toJSON(), leads_count: count };
            }));
        }

        // 7. Ticket Statuses - TicketStatus::withCount('tickets')->get()
        let ticketStatusData = [];
        try {
            ticketStatusData = await sequelize.query(`
                SELECT ts.id, ts.name, ts.pick_color, COUNT(t.id) as tickets_count 
                FROM ticket_statuses ts
                LEFT JOIN tickets t ON t.ticket_status_id = ts.id
                GROUP BY ts.id, ts.name, ts.pick_color
                ORDER BY ts.id
            `, { type: QueryTypes.SELECT });
        } catch (err) {
            console.log('Ticket status query error:', err.message);
            const ticketStatuses = await TicketStatus.findAll();
            ticketStatusData = await Promise.all(ticketStatuses.map(async (status) => {
                const count = await Ticket.count({ where: { ticket_status_id: status.id } });
                return { ...status.toJSON(), tickets_count: count };
            }));
        }

        // 8. Weekly Payment Chart
        // Laravel uses week starting Monday (1 = Monday, 7 = Sunday)
        // $weekNames = [1 => 'Monday', 2 => 'Tuesday', ..., 7 => 'Sunday']
        const weekNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const today = new Date();

        // Get start of current week (Monday) - matches Carbon::now()->startOfWeek()
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday
        const startOfCurrentWeek = new Date(today);
        startOfCurrentWeek.setDate(today.getDate() - diff);
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        // Get end of current week (Sunday) - matches Carbon::now()->endOfWeek()
        const endOfCurrentWeek = new Date(startOfCurrentWeek);
        endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);
        endOfCurrentWeek.setHours(23, 59, 59, 999);

        // Get last week dates - matches Carbon::now()->subWeek()->startOfWeek()
        const startOfLastWeek = new Date(startOfCurrentWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        const endOfLastWeek = new Date(endOfCurrentWeek);
        endOfLastWeek.setDate(endOfLastWeek.getDate() - 7);

        // Initialize weekly data with Laravel's week order (Monday first)
        const currentWeekInvoices = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };
        const lastWeekInvoices = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 };

        try {
            // Current week invoices - matches Laravel:
            // Invoice::where('payment_status', Invoice::STATUS_PAID)
            //         ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            const currentWeekPaid = await Invoice.findAll({
                where: {
                    payment_status: Invoice.STATUS_PAID,
                    created_at: {
                        [Op.between]: [startOfCurrentWeek, endOfCurrentWeek]
                    }
                }
            });

            currentWeekPaid.forEach(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                const dayOfWeek = invoiceDate.getDay(); // 0 = Sunday
                // Convert to Laravel format: 0 (Sunday) -> 'Sunday', 1 (Monday) -> 'Monday', etc.
                const dayName = dayOfWeek === 0 ? 'Sunday' : weekNames[dayOfWeek - 1];
                currentWeekInvoices[dayName] += parseFloat(invoice.total_amount) || 0;
            });

            // Last week invoices
            const lastWeekPaid = await Invoice.findAll({
                where: {
                    payment_status: Invoice.STATUS_PAID,
                    created_at: {
                        [Op.between]: [startOfLastWeek, endOfLastWeek]
                    }
                }
            });

            lastWeekPaid.forEach(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                const dayOfWeek = invoiceDate.getDay();
                const dayName = dayOfWeek === 0 ? 'Sunday' : weekNames[dayOfWeek - 1];
                lastWeekInvoices[dayName] += parseFloat(invoice.total_amount) || 0;
            });
        } catch (err) {
            console.log('Weekly invoices query error:', err.message);
        }

        // 9. Income vs Expense (Current Year) - Monthly breakdown
        // Laravel: $invoices = Invoice::whereYear('created_at', Carbon::now()->year)
        //                           ->select(DB::raw('MONTH(created_at) as month,invoices.*'))->get()
        // expense: ->whereNotNull('payment_mode_id')
        const currentYear = today.getFullYear();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const monthWiseRecords = {
            income: {},
            expenses: {}
        };

        // Initialize all months
        monthNames.forEach(month => {
            monthWiseRecords.income[month] = 0;
            monthWiseRecords.expenses[month] = 0;
        });

        try {
            // Income: paid invoices this year
            // Laravel: $invoices->where('payment_status', Invoice::STATUS_PAID)->sum('total_amount')
            const paidInvoices = await Invoice.findAll({
                where: {
                    payment_status: Invoice.STATUS_PAID,
                    created_at: {
                        [Op.gte]: new Date(currentYear, 0, 1),
                        [Op.lte]: new Date(currentYear, 11, 31)
                    }
                }
            });

            paidInvoices.forEach(invoice => {
                const month = new Date(invoice.created_at).getMonth();
                monthWiseRecords.income[monthNames[month]] += parseFloat(invoice.total_amount) || 0;
            });

            // Expenses: ONLY count expenses where payment_mode_id is NOT NULL
            // Laravel: $expenses->whereNotNull('payment_mode_id')->sum('amount')
            const expenses = await Expense.findAll({
                where: {
                    payment_mode_id: { [Op.ne]: null }, // whereNotNull('payment_mode_id')
                    created_at: {
                        [Op.gte]: new Date(currentYear, 0, 1),
                        [Op.lte]: new Date(currentYear, 11, 31)
                    }
                }
            });

            expenses.forEach(expense => {
                const month = new Date(expense.created_at).getMonth();
                monthWiseRecords.expenses[monthNames[month]] += parseFloat(expense.amount) || 0;
            });
        } catch (err) {
            console.log('Monthly records query error:', err.message);
        }

        // 10. Expiring Contracts (current month)
        // Laravel: Contract::with('customer')->whereMonth('end_date', Carbon::now()->month)->get()
        let contractsCurrentMonths = [];
        try {
            const currentMonth = today.getMonth() + 1;
            contractsCurrentMonths = await sequelize.query(`
                SELECT c.id, c.subject, c.start_date, c.end_date, c.contract_value, 
                       cu.company_name as customer_name
                FROM contracts c
                LEFT JOIN customers cu ON c.customer_id = cu.id
                WHERE EXTRACT(MONTH FROM c.end_date) = :month
                  AND EXTRACT(YEAR FROM c.end_date) = :year
                ORDER BY c.end_date
            `, {
                replacements: { month: currentMonth, year: currentYear },
                type: QueryTypes.SELECT
            });
        } catch (err) {
            console.log('Contracts query error:', err.message);
        }

        // Project status constants - matches Project::STATUS
        const projectStatus = Project.STATUS;

        res.json({
            invoiceStatusCount,
            proposalStatusCount,
            estimateStatusCount,
            projectStatusCount,
            customerCount,
            memberCount,
            leadStatuses: leadStatusData,
            ticketStatus: ticketStatusData,
            projectStatus,
            currentWeekInvoices,
            lastWeekInvoices,
            monthWiseRecords,
            contractsCurrentMonths,
            currentMonth: today.getMonth() + 1
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Contract month filter
 * Replicates DashboardController@contractMonthFilter
 * 
 * Laravel: Contract::with('customer')->whereMonth('end_date', $filterMonth)->get()
 */
export const contractMonthFilter = async (req, res) => {
    try {
        const { month } = req.query;
        const filterMonth = parseInt(month);
        const currentYear = new Date().getFullYear();

        if (!filterMonth || filterMonth < 1 || filterMonth > 12) {
            return res.status(400).json({ success: false, message: 'Invalid month' });
        }

        const contractsCurrentMonths = await sequelize.query(`
            SELECT c.id, c.subject, c.start_date, c.end_date, c.contract_value, 
                   cu.company_name as customer_name
            FROM contracts c
            LEFT JOIN customers cu ON c.customer_id = cu.id
            WHERE EXTRACT(MONTH FROM c.end_date) = :month
              AND EXTRACT(YEAR FROM c.end_date) = :year
            ORDER BY c.end_date
        `, {
            replacements: { month: filterMonth, year: currentYear },
            type: QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: contractsCurrentMonths,
            message: 'Contract Month Filter retrieved successfully.'
        });
    } catch (error) {
        console.error('Error filtering contracts:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export default {
    getDashboardStats,
    contractMonthFilter
};

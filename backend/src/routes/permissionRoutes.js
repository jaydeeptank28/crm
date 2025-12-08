/**
 * Permission Routes - Matches Laravel PermissionTableSeeder order
 * 
 * Laravel query in MemberController@create:
 * Permission::where('type', '!=', 'Contacts')->get()->groupBy('type');
 */

import express from 'express';
import Permission from '../models/Permission.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { Op } from 'sequelize';

const router = express.Router();

// Permission type order from Laravel PermissionTableSeeder (EXCLUDING Contacts)
const TYPE_ORDER = [
    'Customers',
    'Members',
    'Articles',
    'Tags',
    'Leads',
    'Tasks',
    'Tickets',
    'Invoices',
    'Payments',
    'Credit Note',
    'Proposals',
    'Estimates',
    'Departments',
    'Predefined Replies',
    'Expenses',
    'Services',
    'Items',
    'TaxRate',
    'Announcements',
    'Calenders',
    'Contracts',
    'Projects',
    'Goals',
    'Settings'
    // 'Contacts' - EXCLUDED per Laravel: where('type', '!=', 'Contacts')
];

// Get all permissions grouped by type in Laravel order
// Matches Laravel: Permission::where('type', '!=', 'Contacts')->get()->groupBy('type')
router.get('/', authMiddleware, async (req, res) => {
    try {
        // EXCLUDE 'Contacts' type - matches Laravel exactly
        const permissions = await Permission.findAll({
            where: {
                type: {
                    [Op.ne]: 'Contacts'
                }
            },
            attributes: ['id', 'name', 'display_name', 'type'],
            order: [['id', 'ASC']] // Order by ID to maintain seeder order
        });

        // Group by type - matches Laravel ->groupBy('type')
        const grouped = {};
        permissions.forEach(p => {
            const type = p.type || 'General';
            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push({
                id: p.id,
                name: p.name,
                display_name: p.display_name
            });
        });

        // Reorder groups to match Laravel seeder order
        const orderedGroups = {};
        TYPE_ORDER.forEach(type => {
            if (grouped[type]) {
                orderedGroups[type] = grouped[type];
            }
        });

        // Add any remaining types not in TYPE_ORDER (but not 'Contacts')
        Object.keys(grouped).forEach(type => {
            if (!orderedGroups[type] && type !== 'Contacts') {
                orderedGroups[type] = grouped[type];
            }
        });

        res.json({
            success: true,
            data: {
                permissions: orderedGroups,
                permissionsList: permissions
            }
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

export default router;

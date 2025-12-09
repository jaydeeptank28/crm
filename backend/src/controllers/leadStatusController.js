import LeadStatus from '../models/LeadStatus.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

/**
 * Get all lead statuses with leads count
 */
export const getLeadStatuses = async (req, res) => {
    try {
        // Get statuses with leads count using raw query
        const statuses = await sequelize.query(`
            SELECT ls.*, COALESCE(COUNT(l.id), 0) as leads_count
            FROM lead_statuses ls
            LEFT JOIN leads l ON l.status_id = ls.id
            GROUP BY ls.id
            ORDER BY ls."order" ASC
        `, { type: QueryTypes.SELECT });

        res.json({ success: true, data: statuses });
    } catch (error) {
        console.error('Error fetching lead statuses:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Create lead status
 */
export const createLeadStatus = async (req, res) => {
    try {
        const { name, color, order } = req.body;

        if (!name || order === undefined) {
            return res.status(422).json({
                success: false,
                message: 'Name and order are required'
            });
        }

        // Check unique name
        const existing = await LeadStatus.findOne({ where: { name } });
        if (existing) {
            return res.status(422).json({
                success: false,
                message: 'Lead status name already exists'
            });
        }

        const status = await LeadStatus.create({
            name,
            color: color || '#6777ef',
            order: parseInt(order) || 0
        });

        res.status(201).json({
            success: true,
            message: 'Lead status created successfully',
            data: status.toJSON()
        });
    } catch (error) {
        console.error('Error creating lead status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Update lead status
 */
export const updateLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color, order } = req.body;

        const status = await LeadStatus.findByPk(id);
        if (!status) {
            return res.status(404).json({ success: false, message: 'Lead status not found' });
        }

        await status.update({
            name: name || status.name,
            color: color || status.color,
            order: order !== undefined ? parseInt(order) : status.order
        });

        res.json({
            success: true,
            message: 'Lead status updated successfully',
            data: status.toJSON()
        });
    } catch (error) {
        console.error('Error updating lead status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Delete lead status
 */
export const deleteLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const status = await LeadStatus.findByPk(id);
        if (!status) {
            return res.status(404).json({ success: false, message: 'Lead status not found' });
        }

        // Check if status is used by any leads
        const leadsCount = await sequelize.query(
            `SELECT COUNT(*) as count FROM leads WHERE status_id = :statusId`,
            { replacements: { statusId: id }, type: QueryTypes.SELECT }
        );

        if (leadsCount[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: "Lead status can't be deleted. It's being used by leads."
            });
        }

        await status.destroy();

        res.json({
            success: true,
            message: 'Lead status deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lead status:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export default {
    getLeadStatuses,
    createLeadStatus,
    updateLeadStatus,
    deleteLeadStatus
};

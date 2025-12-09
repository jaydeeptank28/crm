import LeadSource from '../models/LeadSource.js';
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

/**
 * Get all lead sources
 */
export const getLeadSources = async (req, res) => {
    try {
        const sources = await LeadSource.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: sources });
    } catch (error) {
        console.error('Error fetching lead sources:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get lead sources with pagination, search, and leads count
 */
export const getLeadSourcesPaginated = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        // Build search condition
        let whereClause = '';
        if (search) {
            whereClause = `WHERE ls.name ILIKE '%${search.replace(/'/g, "''")}%'`;
        }

        // Get total count
        const countResult = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM lead_sources ls
            ${whereClause}
        `, { type: QueryTypes.SELECT });
        const total = parseInt(countResult[0].count);

        // Get paginated sources with leads count
        const sources = await sequelize.query(`
            SELECT ls.*, COALESCE(COUNT(l.id), 0) as leads_count
            FROM lead_sources ls
            LEFT JOIN leads l ON l.source_id = ls.id
            ${whereClause}
            GROUP BY ls.id
            ORDER BY ls.name ASC
            LIMIT :limit OFFSET :offset
        `, {
            replacements: { limit, offset },
            type: QueryTypes.SELECT
        });

        const pages = Math.ceil(total / limit);
        const from = total > 0 ? offset + 1 : 0;
        const to = Math.min(offset + limit, total);

        res.json({
            success: true,
            data: {
                sources,
                pagination: {
                    total,
                    pages,
                    page,
                    limit,
                    from,
                    to
                }
            }
        });
    } catch (error) {
        console.error('Error fetching lead sources:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Create lead source
 */
export const createLeadSource = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(422).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Check unique name
        const existing = await LeadSource.findOne({ where: { name } });
        if (existing) {
            return res.status(422).json({
                success: false,
                message: 'Lead source name already exists'
            });
        }

        const source = await LeadSource.create({ name });

        res.status(201).json({
            success: true,
            message: 'Lead source created successfully',
            data: source.toJSON()
        });
    } catch (error) {
        console.error('Error creating lead source:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Update lead source
 */
export const updateLeadSource = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const source = await LeadSource.findByPk(id);
        if (!source) {
            return res.status(404).json({ success: false, message: 'Lead source not found' });
        }

        await source.update({ name: name || source.name });

        res.json({
            success: true,
            message: 'Lead source updated successfully',
            data: source.toJSON()
        });
    } catch (error) {
        console.error('Error updating lead source:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Delete lead source
 */
export const deleteLeadSource = async (req, res) => {
    try {
        const { id } = req.params;

        const source = await LeadSource.findByPk(id);
        if (!source) {
            return res.status(404).json({ success: false, message: 'Lead source not found' });
        }

        // Check if source is used by any leads
        const leadsCount = await sequelize.query(
            `SELECT COUNT(*) as count FROM leads WHERE source_id = :sourceId`,
            { replacements: { sourceId: id }, type: QueryTypes.SELECT }
        );

        if (leadsCount[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: "Lead source can't be deleted. It's being used by leads."
            });
        }

        await source.destroy();

        res.json({
            success: true,
            message: 'Lead source deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lead source:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export default {
    getLeadSources,
    getLeadSourcesPaginated,
    createLeadSource,
    updateLeadSource,
    deleteLeadSource
};

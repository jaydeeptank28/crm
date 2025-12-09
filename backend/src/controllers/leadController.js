import Lead from '../models/Lead.js';
import LeadStatus from '../models/LeadStatus.js';
import LeadSource from '../models/LeadSource.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';

/**
 * Get all leads with pagination, search, and filters
 */
export const getLeads = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const statusId = req.query.status || '';
        const sourceId = req.query.source || '';

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { company_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (statusId) {
            whereClause.status_id = statusId;
        }

        if (sourceId) {
            whereClause.source_id = sourceId;
        }

        const { count, rows: leads } = await Lead.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        // Get lead statuses, sources, and assigned members for each lead
        const leadsWithRelations = await Promise.all(leads.map(async (lead) => {
            const l = lead.toJSON();

            // Get status
            const status = await LeadStatus.findByPk(l.status_id);
            l.leadStatus = status ? status.toJSON() : null;

            // Get source
            const source = await LeadSource.findByPk(l.source_id);
            l.leadSource = source ? source.toJSON() : null;

            // Get assigned member
            if (l.assign_to) {
                const assignedTo = await User.findByPk(l.assign_to, {
                    attributes: ['id', 'first_name', 'last_name', 'image']
                });
                if (assignedTo) {
                    const user = assignedTo.toJSON();
                    l.assignedTo = {
                        ...user,
                        full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
                        image_url: user.image ? `/uploads/profiles/${user.image}` : null
                    };
                }
            }

            return l;
        }));

        // Get status counts for carousel
        const statusCounts = await sequelize.query(`
            SELECT ls.id, ls.name, ls.color, ls.order, COUNT(l.id) as leads_count
            FROM lead_statuses ls
            LEFT JOIN leads l ON l.status_id = ls.id
            GROUP BY ls.id, ls.name, ls.color, ls.order
            ORDER BY ls.order ASC
        `, { type: QueryTypes.SELECT });

        res.json({
            success: true,
            data: {
                leads: leadsWithRelations,
                statusCounts,
                pagination: {
                    total: count,
                    pages: Math.ceil(count / limit),
                    page,
                    limit,
                    from: offset + 1,
                    to: Math.min(offset + limit, count)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Get single lead by ID with all relations
 */
export const getLead = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findByPk(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        const l = lead.toJSON();

        // Get status
        const status = await LeadStatus.findByPk(l.status_id);
        l.leadStatus = status ? status.toJSON() : null;

        // Get source
        const source = await LeadSource.findByPk(l.source_id);
        l.leadSource = source ? source.toJSON() : null;

        // Get assigned member
        if (l.assign_to) {
            const assignedTo = await User.findByPk(l.assign_to, {
                attributes: ['id', 'first_name', 'last_name', 'image', 'email']
            });
            if (assignedTo) {
                const user = assignedTo.toJSON();
                l.assignedTo = {
                    ...user,
                    full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
                    image_url: user.image ? `/uploads/profiles/${user.image}` : null
                };
            }
        }

        // Get tags
        try {
            const tags = await sequelize.query(`
                SELECT t.id, t.name FROM tags t
                INNER JOIN taggables tg ON tg.tag_id = t.id
                WHERE tg.taggable_id = :leadId AND tg.taggable_type = 'App\\\\Models\\\\Lead'
            `, {
                replacements: { leadId: id },
                type: QueryTypes.SELECT
            });
            l.tags = tags;
        } catch (e) {
            l.tags = [];
        }

        // Get country name
        if (l.country) {
            try {
                const countryData = await sequelize.query(
                    `SELECT name FROM countries WHERE id = :countryId LIMIT 1`,
                    { replacements: { countryId: l.country }, type: QueryTypes.SELECT }
                );
                l.countryName = countryData[0]?.name || null;
            } catch (e) {
                l.countryName = null;
            }
        }

        res.json({
            success: true,
            data: { lead: l }
        });
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Get form data (statuses, sources, members, countries, tags)
 */
export const getFormData = async (req, res) => {
    try {
        // Get statuses
        const statuses = await LeadStatus.findAll({ order: [['order', 'ASC']] });

        // Get sources
        const sources = await LeadSource.findAll({ order: [['name', 'ASC']] });

        // Get members (staff)
        const members = await User.findAll({
            where: { is_enable: true },
            attributes: ['id', 'first_name', 'last_name'],
            order: [['first_name', 'ASC']]
        });
        const membersList = members.map(m => ({
            id: m.id,
            name: `${m.first_name} ${m.last_name || ''}`.trim()
        }));

        // Get countries
        let countries = [];
        try {
            countries = await sequelize.query(
                `SELECT id, name FROM countries ORDER BY name ASC`,
                { type: QueryTypes.SELECT }
            );
        } catch (e) { }

        // Get tags
        let tags = [];
        try {
            tags = await sequelize.query(
                `SELECT id, name FROM tags ORDER BY name ASC`,
                { type: QueryTypes.SELECT }
            );
        } catch (e) { }

        res.json({
            success: true,
            data: {
                statuses: statuses.map(s => s.toJSON()),
                sources: sources.map(s => s.toJSON()),
                members: membersList,
                countries,
                tags,
                languages: Lead.LANGUAGES
            }
        });
    } catch (error) {
        console.error('Error fetching form data:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Create new lead
 */
export const createLead = async (req, res) => {
    try {
        const {
            name, company_name, status_id, source_id, assign_to,
            position, website, phone, description, default_language,
            estimate_budget, public: isPublic, contacted_today, date_contacted, country, tags
        } = req.body;

        // Validation
        if (!name || !company_name || !status_id || !source_id) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: {
                    name: !name ? 'Name is required' : null,
                    company_name: !company_name ? 'Company name is required' : null,
                    status_id: !status_id ? 'Status is required' : null,
                    source_id: !source_id ? 'Source is required' : null
                }
            });
        }

        // Check unique name
        const existingLead = await Lead.findOne({ where: { name } });
        if (existingLead) {
            return res.status(422).json({
                success: false,
                message: 'Lead name already exists',
                errors: { name: 'A lead with this name already exists' }
            });
        }

        const lead = await Lead.create({
            name,
            company_name,
            status_id,
            source_id,
            assign_to: assign_to || null,
            position: position || null,
            website: website || null,
            phone: phone || null,
            description: description || null,
            default_language: default_language || null,
            estimate_budget: estimate_budget ? parseFloat(estimate_budget) : null,
            public: isPublic ? 1 : 0,
            contacted_today: contacted_today !== false && contacted_today !== '0' ? 1 : 0,
            date_contacted: contacted_today ? new Date() : null,
            country: country || null
        });

        // Handle tags
        if (tags && Array.isArray(tags) && tags.length > 0) {
            for (const tagId of tags) {
                try {
                    await sequelize.query(`
                        INSERT INTO taggables (tag_id, taggable_id, taggable_type)
                        VALUES (:tagId, :leadId, 'App\\\\Models\\\\Lead')
                    `, {
                        replacements: { tagId, leadId: lead.id },
                        type: QueryTypes.INSERT
                    });
                } catch (e) { }
            }
        }

        // Activity log
        try {
            await sequelize.query(`
                INSERT INTO activity_log (log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at)
                VALUES ('New Lead created.', :description, 'App\\\\Models\\\\Lead', :subjectId, 'App\\\\Models\\\\User', :causerId, '{}', NOW(), NOW())
            `, {
                replacements: {
                    description: `${name} Lead created.`,
                    subjectId: lead.id,
                    causerId: req.user?.id || 1
                },
                type: QueryTypes.INSERT
            });
        } catch (e) { }

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: { lead: lead.toJSON() }
        });
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Update lead
 */
export const updateLead = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, company_name, status_id, source_id, assign_to,
            position, website, phone, description, default_language,
            estimate_budget, public: isPublic, contacted_today, date_contacted, country, tags
        } = req.body;

        const lead = await Lead.findByPk(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        // Validation
        if (!company_name || !status_id || !source_id) {
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: {
                    company_name: !company_name ? 'Company name is required' : null,
                    status_id: !status_id ? 'Status is required' : null,
                    source_id: !source_id ? 'Source is required' : null
                }
            });
        }

        // Check unique name (excluding current lead)
        if (name && name !== lead.name) {
            const existingLead = await Lead.findOne({ where: { name, id: { [Op.ne]: id } } });
            if (existingLead) {
                return res.status(422).json({
                    success: false,
                    message: 'Lead name already exists',
                    errors: { name: 'A lead with this name already exists' }
                });
            }
        }

        await lead.update({
            name: name || lead.name,
            company_name,
            status_id,
            source_id,
            assign_to: assign_to || null,
            position: position || null,
            website: website || null,
            phone: phone || null,
            description: description || null,
            default_language: default_language || null,
            estimate_budget: estimate_budget ? parseFloat(estimate_budget) : null,
            public: isPublic ? 1 : 0,
            contacted_today: contacted_today ? 1 : 0,
            date_contacted: date_contacted || lead.date_contacted,
            country: country || null
        });

        // Update tags
        if (tags !== undefined) {
            // Remove existing tags
            try {
                await sequelize.query(`
                    DELETE FROM taggables WHERE taggable_id = :leadId AND taggable_type = 'App\\\\Models\\\\Lead'
                `, { replacements: { leadId: id }, type: QueryTypes.DELETE });
            } catch (e) { }

            // Add new tags
            if (Array.isArray(tags) && tags.length > 0) {
                for (const tagId of tags) {
                    try {
                        await sequelize.query(`
                            INSERT INTO taggables (tag_id, taggable_id, taggable_type)
                            VALUES (:tagId, :leadId, 'App\\\\Models\\\\Lead')
                        `, {
                            replacements: { tagId, leadId: id },
                            type: QueryTypes.INSERT
                        });
                    } catch (e) { }
                }
            }
        }

        // Activity log
        try {
            await sequelize.query(`
                INSERT INTO activity_log (log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at)
                VALUES ('Lead updated.', :description, 'App\\\\Models\\\\Lead', :subjectId, 'App\\\\Models\\\\User', :causerId, '{}', NOW(), NOW())
            `, {
                replacements: {
                    description: `${lead.name} Lead updated.`,
                    subjectId: lead.id,
                    causerId: req.user?.id || 1
                },
                type: QueryTypes.INSERT
            });
        } catch (e) { }

        res.json({
            success: true,
            message: 'Lead updated successfully',
            data: { lead: lead.toJSON() }
        });
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Delete lead
 */
export const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;

        const lead = await Lead.findByPk(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        // Check if lead has proposals
        try {
            const proposals = await sequelize.query(`
                SELECT id FROM proposals WHERE owner_id = :leadId AND owner_type = 'App\\\\Models\\\\Lead' LIMIT 1
            `, { replacements: { leadId: id }, type: QueryTypes.SELECT });

            if (proposals.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Lead can't be deleted. It has associated proposals."
                });
            }
        } catch (e) { }

        const leadName = lead.name;

        // Delete tags
        try {
            await sequelize.query(`
                DELETE FROM taggables WHERE taggable_id = :leadId AND taggable_type = 'App\\\\Models\\\\Lead'
            `, { replacements: { leadId: id }, type: QueryTypes.DELETE });
        } catch (e) { }

        // Delete lead
        await lead.destroy();

        // Activity log
        try {
            await sequelize.query(`
                INSERT INTO activity_log (log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at)
                VALUES ('Lead deleted.', :description, 'App\\\\Models\\\\Lead', :subjectId, 'App\\\\Models\\\\User', :causerId, '{}', NOW(), NOW())
            `, {
                replacements: {
                    description: `${leadName} Lead deleted.`,
                    subjectId: id,
                    causerId: req.user?.id || 1
                },
                type: QueryTypes.INSERT
            });
        } catch (e) { }

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Change lead status
 */
export const changeStatus = async (req, res) => {
    try {
        const { id, statusId } = req.params;

        const lead = await Lead.findByPk(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }

        await lead.update({ status_id: statusId });

        res.json({
            success: true,
            message: 'Lead status updated successfully'
        });
    } catch (error) {
        console.error('Error changing lead status:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Get kanban data
 */
export const getKanbanData = async (req, res) => {
    try {
        const statuses = await LeadStatus.findAll({ order: [['order', 'ASC']] });

        const kanbanData = await Promise.all(statuses.map(async (status) => {
            const leads = await Lead.findAll({
                where: { status_id: status.id },
                order: [['created_at', 'DESC']]
            });

            const leadsWithRelations = await Promise.all(leads.map(async (lead) => {
                const l = lead.toJSON();

                // Get source
                const source = await LeadSource.findByPk(l.source_id);
                l.leadSource = source ? source.toJSON() : null;

                // Get assigned member
                if (l.assign_to) {
                    const assignedTo = await User.findByPk(l.assign_to, {
                        attributes: ['id', 'first_name', 'last_name', 'image']
                    });
                    if (assignedTo) {
                        const user = assignedTo.toJSON();
                        l.assignedTo = {
                            ...user,
                            full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
                            image_url: user.image ? `/uploads/profiles/${user.image}` : null
                        };
                    }
                }

                return l;
            }));

            return {
                status: status.toJSON(),
                leads: leadsWithRelations
            };
        }));

        res.json({
            success: true,
            data: { kanban: kanbanData }
        });
    } catch (error) {
        console.error('Error fetching kanban data:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export default {
    getLeads,
    getLead,
    getFormData,
    createLead,
    updateLead,
    deleteLead,
    changeStatus,
    getKanbanData
};

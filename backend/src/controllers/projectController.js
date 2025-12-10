import { Project, ProjectMember, Customer, User } from '../models/index.js';
import { Op } from 'sequelize';

// Get sync data for project forms
export const getSyncData = async (req, res) => {
    try {
        // Get customers
        const customersData = await Customer.findAll({
            attributes: ['id', 'company_name'],
            order: [['company_name', 'ASC']]
        });
        const customers = {};
        customersData.forEach(c => { customers[c.id] = c.company_name; });

        // Get members (staff users)
        const membersData = await User.findAll({
            where: { is_enable: true },
            attributes: ['id', 'first_name', 'last_name'],
            order: [['first_name', 'ASC']]
        });
        const members = {};
        membersData.forEach(m => { members[m.id] = `${m.first_name} ${m.last_name}`; });

        // Static data matching PHP exactly
        const billingTypes = Project.BILLING_TYPES;
        const status = Project.STATUS;
        const tags = {}; // Tags would come from Tag model

        res.json({
            success: true,
            data: {
                customers,
                members,
                billingTypes,
                status,
                tags
            }
        });
    } catch (error) {
        console.error('Error getting sync data:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all projects with pagination
export const index = async (req, res) => {
    try {
        const { status, billing_type, search } = req.query;

        const where = {};
        if (status !== undefined && status !== '') {
            where.status = parseInt(status);
        }
        if (billing_type !== undefined && billing_type !== '') {
            where.billing_type = parseInt(billing_type);
        }
        if (search) {
            where.project_name = { [Op.like]: `%${search}%` };
        }

        const projects = await Project.findAll({
            where,
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'company_name'] },
                {
                    model: ProjectMember,
                    as: 'members',
                    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'image'] }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Calculate status counts
        const allProjects = await Project.findAll({ attributes: ['status'] });
        const statusCount = {
            not_started: allProjects.filter(p => p.status === 0).length,
            in_progress: allProjects.filter(p => p.status === 1).length,
            on_hold: allProjects.filter(p => p.status === 2).length,
            cancelled: allProjects.filter(p => p.status === 3).length,
            finished: allProjects.filter(p => p.status === 4).length
        };

        res.json({
            success: true,
            data: projects.map(p => ({
                ...p.toJSON(),
                billing_type_text: Project.BILLING_TYPES[p.billing_type],
                status_text: Project.STATUS[p.status],
                status_badge: Project.STATUS_BADGE[p.status],
                card_color: Project.CARD_COLOR[p.status]
            })),
            statusCount,
            statusArr: Project.STATUS,
            billingTypes: Project.BILLING_TYPES
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single project for edit
export const edit = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id, {
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'company_name'] },
                { model: ProjectMember, as: 'members', attributes: ['user_id'] }
            ]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Get sync data for form
        const customersData = await Customer.findAll({ attributes: ['id', 'company_name'] });
        const customers = {};
        customersData.forEach(c => { customers[c.id] = c.company_name; });

        const membersData = await User.findAll({ where: { is_enable: true }, attributes: ['id', 'first_name', 'last_name'] });
        const members = {};
        membersData.forEach(m => { members[m.id] = `${m.first_name} ${m.last_name}`; });

        const selectedMembers = project.members.map(m => m.user_id);

        res.json({
            success: true,
            data: {
                project: project.toJSON(),
                customers,
                members,
                billingTypes: Project.BILLING_TYPES,
                status: Project.STATUS,
                tags: {},
                selectedMembers
            }
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Show single project details
export const show = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id, {
            include: [
                { model: Customer, as: 'customer', attributes: ['id', 'company_name'] },
                {
                    model: ProjectMember,
                    as: 'members',
                    include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'image'] }]
                }
            ]
        });

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.json({
            success: true,
            data: {
                ...project.toJSON(),
                billing_type_text: Project.BILLING_TYPES[project.billing_type],
                status_text: Project.STATUS[project.status],
                status_badge: Project.STATUS_BADGE[project.status]
            }
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Store new project
export const store = async (req, res) => {
    try {
        const {
            project_name,
            customer_id,
            members,
            calculate_progress_through_tasks,
            progress,
            billing_type,
            status,
            estimated_hours,
            start_date,
            deadline,
            description,
            send_email,
            tags
        } = req.body;

        // Validation
        if (!project_name) {
            return res.status(400).json({ success: false, message: 'Project name is required' });
        }
        if (!customer_id) {
            return res.status(400).json({ success: false, message: 'Customer is required' });
        }
        if (!members || members.length === 0) {
            return res.status(400).json({ success: false, message: 'Members are required' });
        }
        if (!start_date) {
            return res.status(400).json({ success: false, message: 'Start date is required' });
        }
        if (!deadline) {
            return res.status(400).json({ success: false, message: 'Deadline is required' });
        }

        // Check unique project name
        const existing = await Project.findOne({ where: { project_name } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Project name already exists' });
        }

        const project = await Project.create({
            project_name,
            customer_id,
            calculate_progress_through_tasks: calculate_progress_through_tasks || false,
            progress: progress || '0',
            billing_type: billing_type || 0,
            status: status || 0,
            estimated_hours,
            start_date,
            deadline,
            description,
            send_email: send_email || false
        });

        // Add members
        if (members && members.length > 0) {
            const memberRecords = members.map(userId => ({
                owner_id: project.id,
                owner_type: 'App\\Models\\Project',
                user_id: userId
            }));
            await ProjectMember.bulkCreate(memberRecords);
        }

        res.status(201).json({
            success: true,
            message: 'Project saved successfully.',
            data: project
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update project
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            project_name,
            customer_id,
            members,
            calculate_progress_through_tasks,
            progress,
            billing_type,
            status,
            estimated_hours,
            start_date,
            deadline,
            description,
            send_email
        } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check status - cannot edit cancelled projects
        if (project.status === Project.STATUS_CANCELLED) {
            return res.status(400).json({ success: false, message: 'Cannot edit cancelled project' });
        }

        // Check unique project name (excluding current)
        if (project_name && project_name !== project.project_name) {
            const existing = await Project.findOne({ where: { project_name, id: { [Op.ne]: id } } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Project name already exists' });
            }
        }

        await project.update({
            project_name: project_name || project.project_name,
            customer_id: customer_id || project.customer_id,
            calculate_progress_through_tasks: calculate_progress_through_tasks !== undefined ? calculate_progress_through_tasks : project.calculate_progress_through_tasks,
            progress: progress || project.progress,
            billing_type: billing_type !== undefined ? billing_type : project.billing_type,
            status: status !== undefined ? status : project.status,
            estimated_hours,
            start_date: start_date || project.start_date,
            deadline: deadline || project.deadline,
            description,
            send_email: send_email !== undefined ? send_email : project.send_email
        });

        // Update members
        if (members && members.length > 0) {
            await ProjectMember.destroy({ where: { owner_id: id, owner_type: 'App\\Models\\Project' } });
            const memberRecords = members.map(userId => ({
                owner_id: id,
                owner_type: 'App\\Models\\Project',
                user_id: userId
            }));
            await ProjectMember.bulkCreate(memberRecords);
        }

        res.json({
            success: true,
            message: 'Project updated successfully.',
            data: project
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete project
export const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Delete members first
        await ProjectMember.destroy({ where: { owner_id: id, owner_type: 'App\\Models\\Project' } });

        await project.destroy();

        res.json({
            success: true,
            message: 'Project deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get members by customer
export const memberAsPerCustomer = async (req, res) => {
    try {
        const { customer_id } = req.query;

        // Get contacts with users for this customer
        // For now return all staff members
        const membersData = await User.findAll({
            where: { is_enable: true },
            attributes: ['id', 'first_name', 'last_name']
        });

        const members = {};
        membersData.forEach(m => { members[m.id] = `${m.first_name} ${m.last_name}`; });

        res.json({
            success: true,
            data: members,
            message: 'Members retrieved successfully.'
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

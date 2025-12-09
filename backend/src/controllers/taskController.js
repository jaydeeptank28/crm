import Task from '../models/Task.js';
import User from '../models/User.js';
import sequelize from '../config/database.js';
import { QueryTypes, Op } from 'sequelize';

/**
 * Get all tasks with pagination, search, and filters
 */
export const getAllTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const priority = req.query.priority || '';
        const memberId = req.query.member_id || '';
        const sortColumn = req.query.sort || 'start_date';
        const sortOrder = req.query.order || 'DESC';

        // Build where clause
        const whereClause = {};

        if (search) {
            whereClause.subject = { [Op.iLike]: `%${search}%` };
        }

        if (status) {
            whereClause.status = parseInt(status);
        }

        if (priority) {
            whereClause.priority = parseInt(priority);
        }

        if (memberId) {
            whereClause.member_id = parseInt(memberId);
        }

        const { count, rows: tasks } = await Task.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [[sortColumn, sortOrder]]
        });

        // Get user info for each task
        const tasksWithRelations = await Promise.all(tasks.map(async (task) => {
            const t = task.toJSON();

            // Get assigned member
            if (t.member_id) {
                const user = await User.findByPk(t.member_id, {
                    attributes: ['id', 'first_name', 'last_name', 'image']
                });
                if (user) {
                    const userData = user.toJSON();
                    t.user = {
                        ...userData,
                        full_name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                        image_url: userData.image ? `/uploads/profiles/${userData.image}` : '/assets/img/avatar-1.png'
                    };
                }
            }

            return t;
        }));

        res.json({
            success: true,
            data: {
                tasks: tasksWithRelations,
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
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
    }
};

/**
 * Get task status counts for carousel
 */
export const getStatusCount = async (req, res) => {
    try {
        const statusCount = {
            not_started: 0,
            in_progress: 0,
            testing: 0,
            awaiting_feedback: 0,
            completed: 0
        };

        const counts = await Task.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        counts.forEach(row => {
            const data = row.toJSON();
            switch (data.status) {
                case 1: statusCount.not_started = parseInt(data.count); break;
                case 2: statusCount.in_progress = parseInt(data.count); break;
                case 3: statusCount.testing = parseInt(data.count); break;
                case 4: statusCount.awaiting_feedback = parseInt(data.count); break;
                case 5: statusCount.completed = parseInt(data.count); break;
            }
        });

        res.json({ success: true, data: statusCount });
    } catch (error) {
        console.error('Error fetching status counts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch status counts' });
    }
};

/**
 * Get single task by ID
 */
export const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const t = task.toJSON();

        // Get assigned member
        if (t.member_id) {
            const user = await User.findByPk(t.member_id, {
                attributes: ['id', 'first_name', 'last_name', 'image']
            });
            if (user) {
                const userData = user.toJSON();
                t.user = {
                    ...userData,
                    full_name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                    image_url: userData.image ? `/uploads/profiles/${userData.image}` : '/assets/img/avatar-1.png'
                };
            }
        }

        res.json({ success: true, data: t });
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch task' });
    }
};

/**
 * Create a new task
 */
export const createTask = async (req, res) => {
    try {
        const {
            subject,
            status = 1,
            priority,
            public: isPublic,
            billable,
            hourly_rate,
            start_date,
            due_date,
            description,
            member_id,
            related_to,
            owner_id,
            owner_type
        } = req.body;

        // Validate required fields
        if (!subject) {
            return res.status(400).json({ success: false, message: 'Subject is required' });
        }

        // Check for unique subject
        const existing = await Task.findOne({ where: { subject } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Task with this subject already exists' });
        }

        const task = await Task.create({
            subject,
            status,
            priority,
            public: isPublic || false,
            billable: billable || false,
            hourly_rate,
            start_date: start_date || null,
            due_date: due_date || null,
            description,
            member_id: member_id || null,
            related_to: related_to || null,
            owner_id: owner_id || null,
            owner_type: owner_type || null
        });

        res.status(201).json({
            success: true,
            message: 'Task saved successfully.',
            data: task
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, message: 'Failed to create task' });
    }
};

/**
 * Update a task
 */
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const {
            subject,
            status,
            priority,
            public: isPublic,
            billable,
            hourly_rate,
            start_date,
            due_date,
            description,
            member_id,
            related_to,
            owner_id,
            owner_type
        } = req.body;

        // Validate required fields
        if (!subject) {
            return res.status(400).json({ success: false, message: 'Subject is required' });
        }

        // Check for unique subject (excluding current task)
        const existing = await Task.findOne({
            where: {
                subject,
                id: { [Op.ne]: id }
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Task with this subject already exists' });
        }

        await task.update({
            subject,
            status,
            priority,
            public: isPublic,
            billable,
            hourly_rate,
            start_date: start_date || null,
            due_date: due_date || null,
            description,
            member_id: member_id || null,
            related_to: related_to || null,
            owner_id: owner_id || null,
            owner_type: owner_type || null
        });

        res.json({
            success: true,
            message: 'Task updated successfully.',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Failed to update task' });
    }
};

/**
 * Delete a task
 */
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.destroy();

        res.json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Failed to delete task' });
    }
};

/**
 * Change task status
 */
export const changeStatus = async (req, res) => {
    try {
        const { id, status } = req.params;
        const task = await Task.findByPk(id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.update({ status: parseInt(status) });

        res.json({
            success: true,
            message: 'Task status updated successfully.'
        });
    } catch (error) {
        console.error('Error changing task status:', error);
        res.status(500).json({ success: false, message: 'Failed to change task status' });
    }
};

/**
 * Get kanban data - tasks grouped by status
 */
export const getKanbanData = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            order: [['created_at', 'DESC']]
        });

        // Get user info for each task and group by status
        const tasksByStatus = {};

        for (const task of tasks) {
            const t = task.toJSON();

            // Get assigned member
            if (t.member_id) {
                const user = await User.findByPk(t.member_id, {
                    attributes: ['id', 'first_name', 'last_name', 'image']
                });
                if (user) {
                    const userData = user.toJSON();
                    t.user = {
                        ...userData,
                        full_name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                        image_url: userData.image ? `/uploads/profiles/${userData.image}` : '/assets/img/avatar-1.png'
                    };
                }
            }

            if (!tasksByStatus[t.status]) {
                tasksByStatus[t.status] = [];
            }
            tasksByStatus[t.status].push(t);
        }

        res.json({
            success: true,
            data: {
                tasks: tasksByStatus,
                statuses: Task.STATUS,
                priorities: Task.PRIORITY,
                relatedTo: Task.RELATED_TO
            }
        });
    } catch (error) {
        console.error('Error fetching kanban data:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch kanban data' });
    }
};

/**
 * Get members list for dropdown
 */
export const getMembers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'first_name', 'last_name'],
            order: [['first_name', 'ASC']]
        });

        const members = users.map(user => ({
            id: user.id,
            full_name: `${user.first_name} ${user.last_name || ''}`.trim()
        }));

        res.json({ success: true, data: members });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch members' });
    }
};

/**
 * Get constants for dropdowns
 */
export const getConstants = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                statuses: Task.STATUS,
                priorities: Task.PRIORITY,
                relatedTo: Task.RELATED_TO,
                statusColors: Task.STATUS_COLORS
            }
        });
    } catch (error) {
        console.error('Error fetching constants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch constants' });
    }
};

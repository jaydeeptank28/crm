import CustomerGroup from '../models/CustomerGroup.js';
import { Op } from 'sequelize';

// Get all customer groups for DataTables
export const index = async (req, res) => {
    try {
        const customerGroups = await CustomerGroup.findAll({
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: customerGroups
        });
    } catch (error) {
        console.error('Error fetching customer groups:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer groups',
            error: error.message
        });
    }
};

// Get single customer group for edit
export const edit = async (req, res) => {
    try {
        const { id } = req.params;
        const customerGroup = await CustomerGroup.findByPk(id);

        if (!customerGroup) {
            return res.status(404).json({
                success: false,
                message: 'Customer Group not found'
            });
        }

        res.json({
            success: true,
            data: customerGroup,
            message: 'Customer Group retrieved successfully.'
        });
    } catch (error) {
        console.error('Error fetching customer group:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer group',
            error: error.message
        });
    }
};

// Create new customer group
export const store = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(422).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Check for duplicate name
        const existing = await CustomerGroup.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(422).json({
                success: false,
                message: 'Customer Group name already exists'
            });
        }

        const customerGroup = await CustomerGroup.create({
            name: name.trim(),
            description: description || null
        });

        res.status(201).json({
            success: true,
            data: customerGroup,
            message: 'Customer Group saved successfully.'
        });
    } catch (error) {
        console.error('Error creating customer group:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating customer group',
            error: error.message
        });
    }
};

// Update customer group
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const customerGroup = await CustomerGroup.findByPk(id);
        if (!customerGroup) {
            return res.status(404).json({
                success: false,
                message: 'Customer Group not found'
            });
        }

        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(422).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Check for duplicate name (exclude current record)
        const existing = await CustomerGroup.findOne({
            where: {
                name: name.trim(),
                id: { [Op.ne]: id }
            }
        });
        if (existing) {
            return res.status(422).json({
                success: false,
                message: 'Customer Group name already exists'
            });
        }

        await customerGroup.update({
            name: name.trim(),
            description: description || null
        });

        res.json({
            success: true,
            message: 'Customer Group updated successfully.'
        });
    } catch (error) {
        console.error('Error updating customer group:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer group',
            error: error.message
        });
    }
};

// Delete customer group
export const destroy = async (req, res) => {
    try {
        const { id } = req.params;

        const customerGroup = await CustomerGroup.findByPk(id);
        if (!customerGroup) {
            return res.status(404).json({
                success: false,
                message: 'Customer Group not found'
            });
        }

        await customerGroup.destroy();

        res.json({
            success: true,
            message: 'Customer Group deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting customer group:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting customer group',
            error: error.message
        });
    }
};

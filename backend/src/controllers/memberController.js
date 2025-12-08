/**
 * Member Controller - 100% Replication of Laravel MemberController.php + MemberRepository.php
 * 
 * Endpoints:
 * - GET /api/members - List with search, pagination, status filter
 * - GET /api/members/:id - Get single member with permissions
 * - POST /api/members - Create member with permissions sync
 * - PUT /api/members/:id - Update member with permissions sync
 * - DELETE /api/members/:id - Delete member with cascade delete
 * - PATCH /api/members/:id/toggle-status - Toggle is_enable
 * - POST /api/members/:id/verify-email - Manual email verification
 * - POST /api/members/:id/impersonate - Impersonate member
 * - POST /api/members/:id/upload-image - Upload profile image
 */

import User from '../models/User.js';
import { sequelize } from '../config/database.js';
import { Op, QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sendEmailVerification, sendWelcomeEmail } from '../services/emailService.js';
import { getFileUrl, deleteFile } from '../middleware/uploadMiddleware.js';
import path from 'path';

/**
 * List members with search, pagination, status filter
 * Replicates Laravel Members.php Livewire component EXACTLY
 */
export const getMembers = async (req, res) => {
    try {
        const {
            page = 1,
            per_page = 12,
            search = '',
            status = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(per_page);
        const limit = parseInt(per_page);

        const whereClause = {
            owner_id: null,
            owner_type: null
        };

        if (status !== '' && status !== undefined) {
            whereClause.is_enable = status === '1' || status === 'true';
        }

        if (search) {
            whereClause[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: members } = await User.findAndCountAll({
            where: whereClause,
            order: [['is_enable', 'DESC'], ['created_at', 'DESC']],
            offset,
            limit,
            attributes: [
                'id', 'first_name', 'last_name', 'email', 'phone',
                'is_enable', 'is_admin', 'email_verified_at', 'image',
                'facebook', 'linkedin', 'skype', 'default_language',
                'created_at', 'updated_at'
            ]
        });

        const memberIds = members.map(m => m.id);
        let projectsCounts = {};
        let memberRoles = {};

        if (memberIds.length > 0) {
            try {
                const projectsData = await sequelize.query(`
                    SELECT user_id, COUNT(*) as count 
                    FROM project_members 
                    WHERE user_id IN (:memberIds)
                    GROUP BY user_id
                `, {
                    replacements: { memberIds },
                    type: QueryTypes.SELECT
                });
                projectsData.forEach(p => {
                    projectsCounts[p.user_id] = parseInt(p.count);
                });
            } catch (e) { }

            try {
                const rolesData = await sequelize.query(`
                    SELECT mhr.model_id as user_id, r.name as role_name
                    FROM model_has_roles mhr
                    JOIN roles r ON mhr.role_id = r.id
                    WHERE mhr.model_id IN (:memberIds)
                    AND mhr.model_type = 'App\\\\Models\\\\User'
                `, {
                    replacements: { memberIds },
                    type: QueryTypes.SELECT
                });
                rolesData.forEach(r => {
                    if (!memberRoles[r.user_id]) memberRoles[r.user_id] = [];
                    memberRoles[r.user_id].push(r.role_name);
                });
            } catch (e) { }
        }

        const formattedMembers = members.map(member => {
            const m = member.toJSON();
            const roles = memberRoles[m.id] || [];
            return {
                ...m,
                full_name: `${m.first_name || ''} ${m.last_name || ''}`.trim(),
                image_url: m.image ? `/uploads/profiles/${m.image}` : null,
                projects_count: projectsCounts[m.id] || 0,
                role_names: m.is_admin ? 'Admin' : (roles.length > 0 ? roles.join(', ') : 'Staff Member')
            };
        });

        res.json({
            success: true,
            data: {
                members: formattedMembers,
                pagination: {
                    current_page: parseInt(page),
                    per_page: limit,
                    total: count,
                    last_page: Math.ceil(count / limit),
                    from: offset + 1,
                    to: Math.min(offset + limit, count)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Get single member by ID with permissions
 */
export const getMember = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        const m = member.toJSON();

        let projectsCount = 0;
        try {
            const result = await sequelize.query(`
                SELECT COUNT(*) as count FROM project_members WHERE user_id = :userId
            `, { replacements: { userId: id }, type: QueryTypes.SELECT });
            projectsCount = parseInt(result[0]?.count) || 0;
        } catch (e) { }

        let memberPermissions = [];
        let permissionIds = [];
        try {
            const permsData = await sequelize.query(`
                SELECT p.id, p.name, p.display_name, p.type
                FROM model_has_permissions mhp
                JOIN permissions p ON mhp.permission_id = p.id
                WHERE mhp.model_id = :userId
                AND mhp.model_type = 'App\\\\Models\\\\User'
            `, { replacements: { userId: id }, type: QueryTypes.SELECT });
            memberPermissions = permsData;
            permissionIds = permsData.map(p => p.id);
        } catch (e) { }

        const permissionsGrouped = {};
        memberPermissions.forEach(p => {
            const type = p.type || 'General';
            if (!permissionsGrouped[type]) permissionsGrouped[type] = [];
            permissionsGrouped[type].push(p);
        });

        let roles = [];
        try {
            const rolesData = await sequelize.query(`
                SELECT r.name
                FROM model_has_roles mhr
                JOIN roles r ON mhr.role_id = r.id
                WHERE mhr.model_id = :userId
                AND mhr.model_type = 'App\\\\Models\\\\User'
            `, { replacements: { userId: id }, type: QueryTypes.SELECT });
            roles = rolesData.map(r => r.name);
        } catch (e) { }

        res.json({
            success: true,
            data: {
                member: {
                    ...m,
                    full_name: `${m.first_name || ''} ${m.last_name || ''}`.trim(),
                    image_url: m.image ? `/uploads/profiles/${m.image}` : null,
                    projects_count: projectsCount,
                    role_names: m.is_admin ? 'Admin' : (roles.length > 0 ? roles.join(', ') : 'Staff Member'),
                    permissions: permissionIds,
                    permissionsGrouped
                }
            }
        });
    } catch (error) {
        console.error('Error fetching member:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Create new member - with email sending and image upload
 */
export const createMember = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            first_name, last_name, email, password, phone,
            facebook, linkedin, skype, default_language,
            staff_member, send_welcome_email
        } = req.body;

        // Handle permissions from multipart form-data (can be 'permissions' or 'permissions[]')
        let permissions = req.body.permissions || req.body['permissions[]'] || [];
        if (!Array.isArray(permissions)) {
            permissions = [permissions];
        }
        permissions = permissions.map(p => parseInt(p)).filter(p => !isNaN(p));

        // Validate required fields
        if (!first_name || !email || !password) {
            await transaction.rollback();
            return res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors: {
                    first_name: !first_name ? 'First name is required' : null,
                    email: !email ? 'Email is required' : null,
                    password: !password ? 'Password is required' : null
                }
            });
        }

        // Check if email exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            await transaction.rollback();
            return res.status(422).json({
                success: false,
                message: 'Email already exists',
                errors: { email: 'This email is already registered' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Handle file upload if present
        let imageName = null;
        if (req.file) {
            imageName = req.file.filename;
        }

        const member = await User.create({
            first_name,
            last_name: last_name || null,
            email,
            password: hashedPassword,
            phone: phone ? phone.replace(/\s/g, '') : null,
            facebook: facebook || null,
            linkedin: linkedin || null,
            skype: skype || null,
            default_language: default_language || null,
            image: imageName,
            is_enable: true,
            is_admin: false
        }, { transaction });

        // Activity log
        try {
            await sequelize.query(`
                INSERT INTO activity_log (log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at)
                VALUES ('New Member created.', :description, 'App\\\\Models\\\\User', :subjectId, 'App\\\\Models\\\\User', :causerId, '{}', NOW(), NOW())
            `, {
                replacements: {
                    description: `${member.first_name} ${member.last_name || ''} Member created.`.trim(),
                    subjectId: member.id,
                    causerId: req.user?.id || 1
                },
                type: QueryTypes.INSERT,
                transaction
            });
        } catch (e) { }

        // Send welcome email if checked
        if (send_welcome_email === true || send_welcome_email === 'true' || send_welcome_email === '1') {
            try {
                await sendWelcomeEmail(member, password);
                console.log('Welcome email sent to:', member.email);
            } catch (e) {
                console.log('Welcome email failed:', e.message);
            }
        }

        // Assign staff_member role
        try {
            const roleResult = await sequelize.query(`
                SELECT id FROM roles WHERE name = 'staff_member' LIMIT 1
            `, { type: QueryTypes.SELECT, transaction });

            if (roleResult.length > 0) {
                await sequelize.query(`
                    INSERT INTO model_has_roles (role_id, model_type, model_id)
                    VALUES (:roleId, 'App\\\\Models\\\\User', :modelId)
                    ON CONFLICT (role_id, model_type, model_id) DO NOTHING
                `, {
                    replacements: { roleId: roleResult[0].id, modelId: member.id },
                    type: QueryTypes.INSERT,
                    transaction
                });
            }
        } catch (e) { }

        // Sync permissions
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            try {
                await sequelize.query(`
                    DELETE FROM model_has_permissions 
                    WHERE model_id = :modelId AND model_type = 'App\\\\Models\\\\User'
                `, { replacements: { modelId: member.id }, type: QueryTypes.DELETE, transaction });

                for (const permId of permissions) {
                    await sequelize.query(`
                        INSERT INTO model_has_permissions (permission_id, model_type, model_id)
                        VALUES (:permId, 'App\\\\Models\\\\User', :modelId)
                    `, {
                        replacements: { permId, modelId: member.id },
                        type: QueryTypes.INSERT,
                        transaction
                    });
                }
            } catch (e) { }
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Member created successfully',
            data: { member: member.toJSON() }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating member:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Update member - with image upload
 */
export const updateMember = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            first_name, last_name, email, password, phone,
            facebook, linkedin, skype, default_language
        } = req.body;

        // Handle permissions from multipart form-data
        let permissions = req.body.permissions || req.body['permissions[]'] || [];
        if (!Array.isArray(permissions)) {
            permissions = [permissions];
        }
        permissions = permissions.map(p => parseInt(p)).filter(p => !isNaN(p));

        const member = await User.findByPk(id);
        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Check if email changed and already exists
        if (email && email !== member.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                await transaction.rollback();
                return res.status(422).json({
                    success: false,
                    message: 'Email already exists',
                    errors: { email: 'This email is already registered' }
                });
            }
        }

        const updateData = {};
        if (first_name !== undefined) updateData.first_name = first_name;
        if (last_name !== undefined) updateData.last_name = last_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone ? phone.replace(/\s/g, '') : null;
        if (facebook !== undefined) updateData.facebook = facebook;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (skype !== undefined) updateData.skype = skype;
        if (default_language !== undefined) updateData.default_language = default_language;

        // Handle file upload
        if (req.file) {
            // Delete old image if exists
            if (member.image) {
                const oldPath = path.join(process.env.UPLOAD_PATH || './uploads', 'profiles', member.image);
                deleteFile(oldPath);
            }
            updateData.image = req.file.filename;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await member.update(updateData, { transaction });

        // Activity log
        try {
            await sequelize.query(`
                INSERT INTO activity_log (log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at)
                VALUES ('Member updated.', :description, 'App\\\\Models\\\\User', :subjectId, 'App\\\\Models\\\\User', :causerId, '{}', NOW(), NOW())
            `, {
                replacements: {
                    description: `${member.first_name} ${member.last_name || ''} Member updated.`.trim(),
                    subjectId: member.id,
                    causerId: req.user?.id || 1
                },
                type: QueryTypes.INSERT,
                transaction
            });
        } catch (e) { }

        // Sync permissions
        if (permissions !== undefined && Array.isArray(permissions)) {
            try {
                await sequelize.query(`
                    DELETE FROM model_has_permissions 
                    WHERE model_id = :modelId AND model_type = 'App\\\\Models\\\\User'
                `, { replacements: { modelId: member.id }, type: QueryTypes.DELETE, transaction });

                for (const permId of permissions) {
                    await sequelize.query(`
                        INSERT INTO model_has_permissions (permission_id, model_type, model_id)
                        VALUES (:permId, 'App\\\\Models\\\\User', :modelId)
                    `, {
                        replacements: { permId, modelId: member.id },
                        type: QueryTypes.INSERT,
                        transaction
                    });
                }
            } catch (e) { }
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Member updated successfully',
            data: { member: member.toJSON() }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating member:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Delete member with CASCADE
 */
export const deleteMember = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const member = await User.findByPk(id);
        if (!member) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        if (req.user && req.user.id === parseInt(id)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Login member can\'t be deleted.'
            });
        }

        const memberName = `${member.first_name} ${member.last_name || ''}`.trim();

        // Delete profile image if exists
        if (member.image) {
            const imagePath = path.join(process.env.UPLOAD_PATH || './uploads', 'profiles', member.image);
            deleteFile(imagePath);
        }

        // CASCADE DELETE
        try {
            await sequelize.query(`DELETE FROM proposals WHERE created_by = :userId`,
                { replacements: { userId: id }, type: QueryTypes.DELETE, transaction });
        } catch (e) { }

        try {
            await sequelize.query(`DELETE FROM goal_members WHERE user_id = :userId`,
                { replacements: { userId: id }, type: QueryTypes.DELETE, transaction });
        } catch (e) { }

        try {
            await sequelize.query(`DELETE FROM projects WHERE created_by = :userId`,
                { replacements: { userId: id }, type: QueryTypes.DELETE, transaction });
        } catch (e) { }

        try {
            await sequelize.query(`DELETE FROM model_has_permissions WHERE model_id = :userId AND model_type = 'App\\\\Models\\\\User'`,
                { replacements: { userId: id }, type: QueryTypes.DELETE, transaction });
        } catch (e) { }

        try {
            await sequelize.query(`DELETE FROM model_has_roles WHERE model_id = :userId AND model_type = 'App\\\\Models\\\\User'`,
                { replacements: { userId: id }, type: QueryTypes.DELETE, transaction });
        } catch (e) { }

        // Activity log
        try {
            await sequelize.query(`
                INSERT INTO activity_log (log_name, description, subject_type, subject_id, causer_type, causer_id, properties, created_at, updated_at)
                VALUES ('Member deleted.', :description, 'App\\\\Models\\\\User', :subjectId, 'App\\\\Models\\\\User', :causerId, '{}', NOW(), NOW())
            `, {
                replacements: {
                    description: `${memberName} Member deleted.`,
                    subjectId: id,
                    causerId: req.user?.id || 1
                },
                type: QueryTypes.INSERT,
                transaction
            });
        } catch (e) { }

        await member.destroy({ transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Member deleted successfully.'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting member:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Toggle member status
 */
export const toggleMemberStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await User.findByPk(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        await member.update({ is_enable: !member.is_enable });

        res.json({
            success: true,
            message: 'Member status updated successfully',
            data: { is_enable: member.is_enable }
        });
    } catch (error) {
        console.error('Error toggling member status:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Manually verify member email
 */
export const verifyMemberEmail = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await User.findByPk(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        await member.update({ email_verified_at: new Date() });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Resend email verification - NOW SENDS ACTUAL EMAIL
 */
export const resendEmailVerification = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await User.findByPk(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        // Generate verification URL
        const verificationUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/verify-email/${member.id}`;

        // Send actual email via Brevo SMTP
        const result = await sendEmailVerification(member, verificationUrl);

        if (result.success) {
            res.json({
                success: true,
                message: 'Verification email has been sent'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error resending verification:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Upload profile image separately
 */
export const uploadMemberImage = async (req, res) => {
    try {
        const { id } = req.params;

        const member = await User.findByPk(id);
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        // Delete old image if exists
        if (member.image) {
            const oldPath = path.join(process.env.UPLOAD_PATH || './uploads', 'profiles', member.image);
            deleteFile(oldPath);
        }

        await member.update({ image: req.file.filename });

        res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                image: req.file.filename,
                image_url: `/uploads/profiles/${req.file.filename}`
            }
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Impersonate member
 */
export const impersonateMember = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.session && req.session.impersonated_by) {
            return res.status(400).json({
                success: false,
                message: 'Already impersonating another user'
            });
        }

        const member = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }

        res.json({
            success: true,
            message: 'Impersonation started',
            data: {
                impersonated_user: member.toJSON(),
                original_user_id: req.user?.id
            }
        });
    } catch (error) {
        console.error('Error impersonating:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

export default {
    getMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    toggleMemberStatus,
    verifyMemberEmail,
    resendEmailVerification,
    uploadMemberImage,
    impersonateMember
};

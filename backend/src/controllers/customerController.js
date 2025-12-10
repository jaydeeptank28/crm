import Customer, { LANGUAGES, CURRENCIES } from '../models/Customer.js';
import CustomerGroup from '../models/CustomerGroup.js';
import Address from '../models/Address.js';
import CustomerToCustomerGroup from '../models/CustomerToCustomerGroup.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';

// Get all customers for list page
export const index = async (req, res) => {
    try {
        const customers = await Customer.findAll({
            include: [
                {
                    model: Address,
                    as: 'addresses',
                    where: { owner_type: 'Customer' },
                    required: false
                },
                {
                    model: CustomerGroup,
                    as: 'customerGroups',
                    through: { attributes: [] },
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

export const getSyncData = async (req, res) => {
    try {
        const customerGroups = await CustomerGroup.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        // TODO: Add countries when Country model is created
        const countries = {};

        res.json({
            success: true,
            data: {
                customerGroups: customerGroups.reduce((acc, group) => {
                    acc[group.id] = group.name;
                    return acc;
                }, {}),
                countries: countries,
                languages: LANGUAGES,
                currencies: CURRENCIES
            }
        });
    } catch (error) {
        console.error('Error fetching sync data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sync data',
            error: error.message
        });
    }
};

// Create new customer
export const store = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            company_name,
            vat_number,
            phone,
            website,
            currency,
            country,
            default_language,
            groups,
            billingAddress,
            shippingAddress
        } = req.body;

        // Validate required fields
        if (!company_name || company_name.trim() === '') {
            await transaction.rollback();
            return res.status(422).json({
                success: false,
                message: 'Company name is required'
            });
        }

        // Check for duplicate company name
        const existingCompany = await Customer.findOne({
            where: { company_name: company_name.trim() }
        });
        if (existingCompany) {
            await transaction.rollback();
            return res.status(422).json({
                success: false,
                message: 'Company name already exists'
            });
        }

        // Check for duplicate phone if provided
        if (phone && phone.trim()) {
            const existingPhone = await Customer.findOne({
                where: { phone: phone.trim() }
            });
            if (existingPhone) {
                await transaction.rollback();
                return res.status(422).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
        }

        // Create customer
        const customer = await Customer.create({
            company_name: company_name.trim(),
            vat_number: vat_number || null,
            phone: phone || null,
            website: website || null,
            currency: currency || null,
            country: country || null,
            default_language: default_language || null
        }, { transaction });

        // Create billing address if provided
        if (billingAddress && billingAddress.street1) {
            await Address.create({
                owner_type: 'Customer',
                owner_id: customer.id,
                type: 'billing',
                street1: billingAddress.street1,
                street2: billingAddress.street2 || null,
                city: billingAddress.city || null,
                state: billingAddress.state || null,
                zip: billingAddress.zip || null,
                country: billingAddress.country || null
            }, { transaction });
        }

        // Create shipping address if provided
        if (shippingAddress && shippingAddress.street1) {
            await Address.create({
                owner_type: 'Customer',
                owner_id: customer.id,
                type: 'shipping',
                street1: shippingAddress.street1,
                street2: shippingAddress.street2 || null,
                city: shippingAddress.city || null,
                state: shippingAddress.state || null,
                zip: shippingAddress.zip || null,
                country: shippingAddress.country || null
            }, { transaction });
        }

        // Assign customer groups if provided
        if (groups && Array.isArray(groups) && groups.length > 0) {
            const groupAssignments = groups.map(groupId => ({
                customer_id: customer.id,
                customer_group_id: groupId
            }));
            await CustomerToCustomerGroup.bulkCreate(groupAssignments, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            data: customer,
            message: 'Customer saved successfully.'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating customer',
            error: error.message
        });
    }
};

// Get customer details for edit
export const edit = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: Address,
                    as: 'addresses',
                    where: { owner_type: 'Customer' },
                    required: false
                },
                {
                    model: CustomerGroup,
                    as: 'customerGroups',
                    through: { attributes: [] },
                    required: false
                }
            ]
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Separate billing and shipping addresses
        const billingAddress = customer.addresses?.find(addr => addr.type === 'billing');
        const shippingAddress = customer.addresses?.find(addr => addr.type === 'shipping');

        res.json({
            success: true,
            data: {
                customer,
                billingAddress,
                shippingAddress,
                selectedGroups: customer.customerGroups?.map(g => g.id) || []
            }
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message
        });
    }
};

// Update customer
export const update = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            company_name,
            vat_number,
            phone,
            website,
            currency,
            country,
            default_language,
            groups,
            billingAddress,
            shippingAddress
        } = req.body;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Validate required fields
        if (!company_name || company_name.trim() === '') {
            await transaction.rollback();
            return res.status(422).json({
                success: false,
                message: 'Company name is required'
            });
        }

        // Check for duplicate company name (exclude current)
        const existingCompany = await Customer.findOne({
            where: {
                company_name: company_name.trim(),
                id: { [Op.ne]: id }
            }
        });
        if (existingCompany) {
            await transaction.rollback();
            return res.status(422).json({
                success: false,
                message: 'Company name already exists'
            });
        }

        // Check for duplicate phone (exclude current)
        if (phone && phone.trim()) {
            const existingPhone = await Customer.findOne({
                where: {
                    phone: phone.trim(),
                    id: { [Op.ne]: id }
                }
            });
            if (existingPhone) {
                await transaction.rollback();
                return res.status(422).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }
        }

        // Update customer
        await customer.update({
            company_name: company_name.trim(),
            vat_number: vat_number || null,
            phone: phone || null,
            website: website || null,
            currency: currency || null,
            country: country || null,
            default_language: default_language || null
        }, { transaction });

        // Update or create billing address
        if (billingAddress) {
            const existingBilling = await Address.findOne({
                where: {
                    owner_type: 'Customer',
                    owner_id: id,
                    type: 'billing'
                }
            });

            if (existingBilling) {
                await existingBilling.update({
                    street1: billingAddress.street1 || null,
                    street2: billingAddress.street2 || null,
                    city: billingAddress.city || null,
                    state: billingAddress.state || null,
                    zip: billingAddress.zip || null,
                    country: billingAddress.country || null
                }, { transaction });
            } else if (billingAddress.street1) {
                await Address.create({
                    owner_type: 'Customer',
                    owner_id: id,
                    type: 'billing',
                    street1: billingAddress.street1,
                    street2: billingAddress.street2 || null,
                    city: billingAddress.city || null,
                    state: billingAddress.state || null,
                    zip: billingAddress.zip || null,
                    country: billingAddress.country || null
                }, { transaction });
            }
        }

        // Update or create shipping address
        if (shippingAddress) {
            const existingShipping = await Address.findOne({
                where: {
                    owner_type: 'Customer',
                    owner_id: id,
                    type: 'shipping'
                }
            });

            if (existingShipping) {
                await existingShipping.update({
                    street1: shippingAddress.street1 || null,
                    street2: shippingAddress.street2 || null,
                    city: shippingAddress.city || null,
                    state: shippingAddress.state || null,
                    zip: shippingAddress.zip || null,
                    country: shippingAddress.country || null
                }, { transaction });
            } else if (shippingAddress.street1) {
                await Address.create({
                    owner_type: 'Customer',
                    owner_id: id,
                    type: 'shipping',
                    street1: shippingAddress.street1,
                    street2: shippingAddress.street2 || null,
                    city: shippingAddress.city || null,
                    state: shippingAddress.state || null,
                    zip: shippingAddress.zip || null,
                    country: shippingAddress.country || null
                }, { transaction });
            }
        }

        // Update customer groups
        await CustomerToCustomerGroup.destroy({
            where: { customer_id: id },
            transaction
        });

        if (groups && Array.isArray(groups) && groups.length > 0) {
            const groupAssignments = groups.map(groupId => ({
                customer_id: id,
                customer_group_id: groupId
            }));
            await CustomerToCustomerGroup.bulkCreate(groupAssignments, { transaction });
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Customer updated successfully.'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer',
            error: error.message
        });
    }
};

// Get customer detail
export const show = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: Address,
                    as: 'addresses',
                    where: { owner_type: 'Customer' },
                    required: false
                },
                {
                    model: CustomerGroup,
                    as: 'customerGroups',
                    through: { attributes: [] },
                    required: false
                }
            ]
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const billingAddress = customer.addresses?.find(addr => addr.type === 'billing');
        const shippingAddress = customer.addresses?.find(addr => addr.type === 'shipping');

        res.json({
            success: true,
            data: {
                customer,
                billingAddress,
                shippingAddress
            }
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message
        });
    }
};

// Delete customer
export const destroy = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const customer = await Customer.findByPk(id);
        if (!customer) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Delete addresses
        await Address.destroy({
            where: {
                owner_type: 'Customer',
                owner_id: id
            },
            transaction
        });

        // Delete customer group assignments
        await CustomerToCustomerGroup.destroy({
            where: { customer_id: id },
            transaction
        });

        // Delete customer
        await customer.destroy({ transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Customer deleted successfully.'
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting customer',
            error: error.message
        });
    }
};

// Search customers (for header search)
export const search = async (req, res) => {
    try {
        const { searchData } = req.query;

        if (!searchData || searchData.trim() === '') {
            return res.json({
                success: true,
                data: []
            });
        }

        const customers = await Customer.findAll({
            where: {
                company_name: {
                    [Op.like]: `%${searchData}%`
                }
            },
            limit: 10,
            attributes: ['id', 'company_name', 'website']
        });

        res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Error searching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching customers',
            error: error.message
        });
    }
};

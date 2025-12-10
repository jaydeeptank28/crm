import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Address from './Address.js';
import CustomerGroup from './CustomerGroup.js';
import CustomerToCustomerGroup from './CustomerToCustomerGroup.js';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Company name is required'
            }
        }
    },
    vat_number: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            is: {
                args: /^(https?:\/\/)?([\ da-z\.-]+)\.([a-z\.]{2,6})([\/ \w \.-]*)*\/?$/,
                msg: 'Invalid website URL format'
            }
        }
    },
    currency: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'INR, AUD, USD, EUR, JPY, GBP, CAD'
    },
    country: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to countries table'
    },
    default_language: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'en, es, fr, de, ru, pt, ar, zh, tr'
    }
}, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

//Define associations
Customer.hasMany(Address, {
    foreignKey: 'owner_id',
    constraints: false,
    scope: {
        owner_type: 'Customer'
    },
    as: 'addresses'
});

Address.belongsTo(Customer, {
    foreignKey: 'owner_id',
    constraints: false,
    as: 'customer'
});

// Many-to-many relationship with CustomerGroup
Customer.belongsToMany(CustomerGroup, {
    through: CustomerToCustomerGroup,
    foreignKey: 'customer_id',
    otherKey: 'customer_group_id',
    as: 'customerGroups'
});

CustomerGroup.belongsToMany(Customer, {
    through: CustomerToCustomerGroup,
    foreignKey: 'customer_group_id',
    otherKey: 'customer_id',
    as: 'customers'
});

// Constants matching PHP
export const LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ru': 'Russian',
    'pt': 'Portuguese',
    'ar': 'Arabic',
    'zh': 'Chinese',
    'tr': 'Turkish'
};

export const CURRENCIES = {
    '0': 'INR',
    '1': 'AUD',
    '2': 'USD',
    '3': 'EUR',
    '4': 'JPY',
    '5': 'GBP',
    '6': 'CAD'
};

export default Customer;

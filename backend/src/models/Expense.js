/**
 * Expense Model - Matches Laravel Expense.php
 */
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Expense = sequelize.define('Expense', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    expense_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    expense_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    currency: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tax_applied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tax_1_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tax_2_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    tax_rate: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    payment_mode_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true
    },
    billable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'expenses',
    timestamps: true,
    underscored: true
});

// Currency constants - matches Laravel Expense::CURRENCIES
Expense.CURRENCIES = {
    0: 'Indian Rupee',
    1: 'Spanish Dollar',
    2: 'USA Dollar',
    3: 'Canada Dollar',
    4: 'Germany Dollar',
    5: 'China Dollar'
};

export default Expense;

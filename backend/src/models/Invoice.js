import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    payment_status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    total_amount: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true
});

// Constants matching Laravel model
Invoice.STATUS_DRAFT = 0;
Invoice.STATUS_UNPAID = 1;
Invoice.STATUS_PAID = 2;
Invoice.STATUS_PARTIALLY_PAID = 3;
Invoice.STATUS_CANCELLED = 4;

export default Invoice;

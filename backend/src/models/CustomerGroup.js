import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const CustomerGroup = sequelize.define('CustomerGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Name is required'
            }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('description');
            return rawValue ? rawValue.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : null;
        }
    }
}, {
    tableName: 'customer_groups',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default CustomerGroup;

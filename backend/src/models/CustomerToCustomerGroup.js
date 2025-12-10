import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const CustomerToCustomerGroup = sequelize.define('CustomerToCustomerGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    customer_group_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customer_groups',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'customer_to_customer_groups',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'customer_group_pivot',
            fields: ['customer_id', 'customer_group_id'],
            unique: true
        }
    ]
});

export default CustomerToCustomerGroup;

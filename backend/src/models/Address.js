import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    owner_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Polymorphic type (Customer, etc)'
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Polymorphic ID'
    },
    type: {
        type: DataTypes.ENUM('billing', 'shipping'),
        allowNull: false,
        defaultValue: 'billing'
    },
    street: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    state: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    zip: {
        type: DataTypes.STRING(6),
        allowNull: true,
        validate: {
            len: {
                args: [0, 6],
                msg: 'Zip code must be maximum 6 characters'
            }
        }
    },
    country: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Foreign key to countries table'
    }
}, {
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'owner_polymorphic',
            fields: ['owner_type', 'owner_id']
        }
    ]
});

export default Address;

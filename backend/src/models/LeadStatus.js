import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeadStatus = sequelize.define('LeadStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'lead_statuses',
    timestamps: true,
    underscored: true
});

export default LeadStatus;

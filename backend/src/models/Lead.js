import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import LeadStatus from './LeadStatus.js';

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status_id: {
        type: DataTypes.INTEGER,
        references: {
            model: LeadStatus,
            key: 'id'
        }
    }
}, {
    tableName: 'leads',
    timestamps: true,
    underscored: true
});

Lead.belongsTo(LeadStatus, { foreignKey: 'status_id' });
LeadStatus.hasMany(Lead, { foreignKey: 'status_id' });

export default Lead;

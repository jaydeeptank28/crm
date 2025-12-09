import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeadSource = sequelize.define('LeadSource', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(191),
        allowNull: false
    }
}, {
    tableName: 'lead_sources',
    timestamps: true,
    underscored: true
});

export default LeadSource;

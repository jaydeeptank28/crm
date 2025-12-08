import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'projects',
    timestamps: true,
    underscored: true
});

Project.STATUS_NOT_STARTED = 0;
Project.STATUS_IN_PROGRESS = 1;
Project.STATUS_ON_HOLD = 2;
Project.STATUS_CANCELLED = 3;
Project.STATUS_FINISHED = 4;

export default Project;

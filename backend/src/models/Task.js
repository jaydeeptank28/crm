import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject: {
        type: DataTypes.STRING(191),
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    priority: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    billable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    hourly_rate: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    related_to: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    owner_type: {
        type: DataTypes.STRING(191),
        allowNull: true
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'tasks',
    timestamps: true,
    underscored: true
});

// Status constants matching PHP Task model
Task.STATUS = {
    1: 'Not Started',
    2: 'In Progress',
    3: 'Testing',
    4: 'Awaiting Feedback',
    5: 'Completed'
};

// Priority constants matching PHP Task model
Task.PRIORITY = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent'
};

// Related To constants matching PHP Task model
Task.RELATED_TO = {
    1: 'Invoice',
    2: 'Customer',
    3: 'Ticket',
    4: 'Project',
    5: 'Proposal',
    6: 'Estimate',
    7: 'Lead',
    8: 'Contract'
};

// Badge colors for status
Task.STATUS_COLORS = {
    1: 'danger',
    2: 'primary',
    3: 'warning',
    4: 'info',
    5: 'success'
};

export default Task;

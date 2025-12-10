import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Project extends Model {
    static BILLING_TYPES = {
        0: 'Fixed Rate',
        1: 'Project Hours',
        2: 'Task Hours'
    };

    static STATUS = {
        0: 'Not Started',
        1: 'In Progress',
        2: 'On Hold',
        3: 'Cancelled',
        4: 'Finished'
    };

    static STATUS_BADGE = {
        0: 'badge-danger',
        1: 'badge-primary',
        2: 'badge-warning',
        3: 'badge-info',
        4: 'badge-success'
    };

    static CARD_COLOR = {
        0: 'danger',
        1: 'primary',
        2: 'warning',
        3: 'info',
        4: 'success'
    };

    static STATUS_NOT_STARTED = 0;
    static STATUS_IN_PROGRESS = 1;
    static STATUS_ON_HOLD = 2;
    static STATUS_CANCELLED = 3;
    static STATUS_FINISHED = 4;

    static associate(models) {
        Project.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
        Project.hasMany(models.ProjectMember, { foreignKey: 'owner_id', as: 'members' });
    }

    getBillingTypeText() {
        return Project.BILLING_TYPES[this.billing_type] || 'N/A';
    }

    getStatusText() {
        return Project.STATUS[this.status] || 'N/A';
    }

    getStatusBadge() {
        return Project.STATUS_BADGE[this.status] || 'badge-secondary';
    }

    getCardColor() {
        return Project.CARD_COLOR[this.status] || 'secondary';
    }
}

Project.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    project_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Project name is required' }
        }
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    calculate_progress_through_tasks: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    progress: {
        type: DataTypes.STRING(10),
        defaultValue: '0'
    },
    billing_type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: [[0, 1, 2]]
        }
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: [[0, 1, 2, 3, 4]]
        }
    },
    estimated_hours: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    deadline: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    send_email: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Project;

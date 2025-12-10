import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ProjectMember extends Model {
    static associate(models) {
        ProjectMember.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        ProjectMember.belongsTo(models.Project, { foreignKey: 'owner_id', as: 'project' });
    }
}

ProjectMember.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    owner_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'App\\Models\\Project'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'ProjectMember',
    tableName: 'project_members',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default ProjectMember;

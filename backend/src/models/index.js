// models/index.js - Central model loader with associations
import sequelize from '../config/database.js';
import User from './User.js';
import Customer from './Customer.js';
import Project from './Project.js';
import ProjectMember from './ProjectMember.js';

// Define associations for Project module
Project.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Project, { foreignKey: 'customer_id', as: 'projects' });

Project.hasMany(ProjectMember, { foreignKey: 'owner_id', as: 'members' });
ProjectMember.belongsTo(Project, { foreignKey: 'owner_id', as: 'project' });

ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export all models
export {
    sequelize,
    User,
    Customer,
    Project,
    ProjectMember
};

export default {
    sequelize,
    User,
    Customer,
    Project,
    ProjectMember
};

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(191),
        allowNull: false
    },
    company_name: {
        type: DataTypes.STRING(191),
        allowNull: false
    },
    status_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    source_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assign_to: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    position: {
        type: DataTypes.STRING(191),
        allowNull: true
    },
    website: {
        type: DataTypes.STRING(191),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    default_language: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    estimate_budget: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    public: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    contacted_today: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    date_contacted: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lead_convert_customer: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lead_convert_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING(191),
        allowNull: true
    }
}, {
    tableName: 'leads',
    timestamps: true,
    underscored: true
});

// Languages constant matching PHP Lead model
Lead.LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'ru': 'Russian',
    'pt': 'Portuguese',
    'ar': 'Arabic',
    'zh': 'Chinese',
    'tr': 'Turkish'
};

export default Lead;

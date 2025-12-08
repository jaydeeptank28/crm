import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Estimate = sequelize.define('Estimate', {
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
    tableName: 'estimates',
    timestamps: true,
    underscored: true
});

Estimate.STATUS_DRAFT = 0;
Estimate.STATUS_SENT = 1;
Estimate.STATUS_EXPIRED = 2;
Estimate.STATUS_DECLINED = 3;
Estimate.STATUS_ACCEPTED = 4;

export default Estimate;

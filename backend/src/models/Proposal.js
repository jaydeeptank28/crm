import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Proposal = sequelize.define('Proposal', {
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
    tableName: 'proposals',
    timestamps: true,
    underscored: true
});

Proposal.STATUS_DRAFT = 0;
Proposal.STATUS_OPEN = 1;
Proposal.STATUS_REVISED = 2;
Proposal.STATUS_DECLINED = 3;
Proposal.STATUS_ACCEPTED = 4;

export default Proposal;

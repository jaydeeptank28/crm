import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TicketStatus = sequelize.define('TicketStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pick_color: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'ticket_statuses',
    timestamps: true,
    underscored: true
});

export default TicketStatus;

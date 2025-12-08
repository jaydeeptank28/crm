import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import TicketStatus from './TicketStatus.js';

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ticket_status_id: {
        type: DataTypes.INTEGER,
        references: {
            model: TicketStatus,
            key: 'id'
        }
    }
}, {
    tableName: 'tickets',
    timestamps: true,
    underscored: true
});

Ticket.belongsTo(TicketStatus, { foreignKey: 'ticket_status_id' });
TicketStatus.hasMany(Ticket, { foreignKey: 'ticket_status_id' });

export default Ticket;

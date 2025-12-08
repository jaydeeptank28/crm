/**
 * Enable admin user in database
 * Run with: node scripts/enableUser.js
 */

import sequelize from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function enableUser() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Enable the admin user
        await sequelize.query(
            `UPDATE users SET is_enable = true WHERE email = 'admin@infycrm.com'`,
            { type: QueryTypes.UPDATE }
        );
        console.log('✅ Updated user is_enable to true');

        // Verify the user
        const users = await sequelize.query(
            `SELECT id, email, is_enable, is_admin FROM users WHERE email = 'admin@infycrm.com'`,
            { type: QueryTypes.SELECT }
        );

        if (users.length > 0) {
            console.log('User details:', users[0]);
        } else {
            console.log('❌ User not found');
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

enableUser();

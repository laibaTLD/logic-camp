'use strict';

/**
 * Update Projects Table Status
 * Description: Replace hardcoded status enum with status_id foreign key
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add status_id column
      await queryInterface.addColumn('projects', 'status_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'statuses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      }, { transaction: t });

      // Migrate existing status data
      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status_id = (SELECT id FROM statuses WHERE name = 'todo' AND is_default = true)
        WHERE status = 'todo'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status_id = (SELECT id FROM statuses WHERE name = 'inProgress' AND is_default = true)
        WHERE status = 'inProgress'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status_id = (SELECT id FROM statuses WHERE name = 'testing' AND is_default = true)
        WHERE status = 'testing'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status_id = (SELECT id FROM statuses WHERE name = 'done' AND is_default = true)
        WHERE status = 'completed'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status_id = (SELECT id FROM statuses WHERE name = 'done' AND is_default = true)
        WHERE status = 'archived'
      `, { transaction: t });

      // Set default status for any null values
      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status_id = (SELECT id FROM statuses WHERE name = 'todo' AND is_default = true)
        WHERE status_id IS NULL
      `, { transaction: t });

      // Make status_id NOT NULL
      await queryInterface.changeColumn('projects', 'status_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'statuses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      }, { transaction: t });

      // Drop old status column
      await queryInterface.removeColumn('projects', 'status', { transaction: t });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add back the old status column
      await queryInterface.addColumn('projects', 'status', {
        type: Sequelize.ENUM('todo', 'inProgress', 'testing', 'completed', 'archived'),
        allowNull: false,
        defaultValue: 'todo',
      }, { transaction: t });

      // Migrate data back
      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status = 'todo'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'todo')
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status = 'inProgress'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'inProgress')
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status = 'testing'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'testing')
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE projects 
        SET status = 'completed'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'done')
      `, { transaction: t });

      // Remove status_id column
      await queryInterface.removeColumn('projects', 'status_id', { transaction: t });
    });
  }
};

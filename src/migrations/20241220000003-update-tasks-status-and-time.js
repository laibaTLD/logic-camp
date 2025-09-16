'use strict';

/**
 * Update Tasks Table Status and Time Tracking
 * Description: Replace hardcoded status enum with status_id foreign key and add time tracking fields
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add status_id column
      await queryInterface.addColumn('tasks', 'status_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'statuses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      }, { transaction: t });

      // Add time tracking columns
      await queryInterface.addColumn('tasks', 'expected_time', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Expected time in minutes',
      }, { transaction: t });

      await queryInterface.addColumn('tasks', 'spent_time', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Spent time in minutes',
      }, { transaction: t });

      // Migrate existing status data
      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status_id = (SELECT id FROM statuses WHERE name = 'todo' AND is_default = true)
        WHERE status = 'todo'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status_id = (SELECT id FROM statuses WHERE name = 'inProgress' AND is_default = true)
        WHERE status = 'inProgress'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status_id = (SELECT id FROM statuses WHERE name = 'testing' AND is_default = true)
        WHERE status = 'testing'
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status_id = (SELECT id FROM statuses WHERE name = 'done' AND is_default = true)
        WHERE status = 'completed'
      `, { transaction: t });

      // Set default status for any null values
      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status_id = (SELECT id FROM statuses WHERE name = 'todo' AND is_default = true)
        WHERE status_id IS NULL
      `, { transaction: t });

      // Make status_id NOT NULL
      await queryInterface.changeColumn('tasks', 'status_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'statuses',
          key: 'id',
        },
        onDelete: 'SET NULL',
      }, { transaction: t });

      // Drop old status column
      await queryInterface.removeColumn('tasks', 'status', { transaction: t });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      // Add back the old status column
      await queryInterface.addColumn('tasks', 'status', {
        type: Sequelize.ENUM('todo', 'inProgress', 'testing', 'completed'),
        allowNull: false,
        defaultValue: 'todo',
      }, { transaction: t });

      // Migrate data back
      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status = 'todo'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'todo')
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status = 'inProgress'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'inProgress')
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status = 'testing'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'testing')
      `, { transaction: t });

      await queryInterface.sequelize.query(`
        UPDATE tasks 
        SET status = 'completed'
        WHERE status_id = (SELECT id FROM statuses WHERE name = 'done')
      `, { transaction: t });

      // Remove new columns
      await queryInterface.removeColumn('tasks', 'status_id', { transaction: t });
      await queryInterface.removeColumn('tasks', 'expected_time', { transaction: t });
      await queryInterface.removeColumn('tasks', 'spent_time', { transaction: t });
    });
  }
};

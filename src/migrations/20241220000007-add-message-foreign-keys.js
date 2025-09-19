'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key constraints to Messages table
    await queryInterface.addConstraint('Messages', {
      fields: ['senderId'],
      type: 'foreign key',
      name: 'Messages_senderId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Messages', {
      fields: ['receiverId'],
      type: 'foreign key',
      name: 'Messages_receiverId_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('Messages', 'Messages_senderId_fkey');
    await queryInterface.removeConstraint('Messages', 'Messages_receiverId_fkey');
  }
};

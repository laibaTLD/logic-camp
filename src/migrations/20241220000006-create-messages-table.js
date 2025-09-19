'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Messages table
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      chatType: {
        type: Sequelize.ENUM('individual', 'group'),
        allowNull: false,
        defaultValue: 'individual',
      },
      chatId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Messages', ['senderId']);
    await queryInterface.addIndex('Messages', ['receiverId']);
    await queryInterface.addIndex('Messages', ['chatType']);
    await queryInterface.addIndex('Messages', ['chatId']);
    await queryInterface.addIndex('Messages', ['createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop Messages table
    await queryInterface.dropTable('Messages');
  }
};

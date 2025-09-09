'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.addColumn(
        'users',
        'is_active',
        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        { transaction: t }
      ).catch(() => {});

      
      await queryInterface.addColumn(
        'teams',
        'is_active',
        { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        { transaction: t }
      ).catch(() => {});

      await queryInterface.addIndex('teams', ['is_active'], { transaction: t }).catch(() => {});
      await queryInterface.addIndex('users', ['is_active'], { transaction: t }).catch(() => {});
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.removeColumn('users', 'is_active', { transaction: t }).catch(() => {});
      await queryInterface.removeColumn('teams', 'is_active', { transaction: t }).catch(() => {});
    });
  }
};



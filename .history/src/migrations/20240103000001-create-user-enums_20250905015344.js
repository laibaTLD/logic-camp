'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create enum types for UserPreferences
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_UserPreferences_theme" AS ENUM ('dark', 'light', 'auto');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_UserPreferences_timeFormat" AS ENUM ('12h', '24h');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop enum types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_UserPreferences_theme";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_UserPreferences_timeFormat";');
  }
};
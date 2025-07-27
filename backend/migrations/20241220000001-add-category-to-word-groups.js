'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('word_groups', 'category', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'ENGLISH',
      after: 'name'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('word_groups', 'category');
  }
}; 
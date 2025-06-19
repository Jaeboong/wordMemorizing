const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TestResult extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      this.belongsTo(models.WordGroup, { foreignKey: 'group_id', as: 'group' });
    }
  }
  
  TestResult.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'word_groups',
        key: 'id'
      }
    },
    total_questions: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    correct_answers: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    test_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'TestResult',
    tableName: 'test_results',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }]
      },
      {
        name: 'fk_test_user',
        using: 'BTREE',
        fields: [{ name: 'user_id' }]
      },
      {
        name: 'fk_test_group',
        using: 'BTREE',
        fields: [{ name: 'group_id' }]
      }
    ]
  });
  
  return TestResult;
}; 
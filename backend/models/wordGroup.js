const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WordGroup extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.Word, { foreignKey: 'group_id', as: 'words' });
      this.hasMany(models.TestResult, { foreignKey: 'group_id', as: 'testResults' });
    }
  }
  
  WordGroup.init({
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'WordGroup',
    tableName: 'word_groups',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }]
      }
    ]
  });
  
  return WordGroup;
}; 
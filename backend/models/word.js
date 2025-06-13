const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Word extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.WordGroup, { foreignKey: 'group_id', as: 'group' });
    }
  }
  
  Word.init({
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'word_groups',
        key: 'id'
      }
    },
    english: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    korean: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Word',
    tableName: 'words',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }]
      },
      {
        name: 'fk_word_group',
        using: 'BTREE',
        fields: [{ name: 'group_id' }]
      }
    ]
  });
  
  return Word;
}; 
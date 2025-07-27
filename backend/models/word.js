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
    // 가상 필드 - 카테고리에 따라 다른 라벨로 접근 가능
    question: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.english;
      },
      set(value) {
        this.setDataValue('english', value);
      }
    },
    answer: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.korean;
      },
      set(value) {
        this.setDataValue('korean', value);
      }
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
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  
  UserPreference.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    preference_key: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    preference_value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'UserPreference',
    tableName: 'user_preferences',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }]
      },
      {
        name: 'fk_preference_user',
        using: 'BTREE',
        fields: [{ name: 'user_id' }]
      },
      {
        name: 'user_preference_unique',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'user_id' }, { name: 'preference_key' }]
      }
    ]
  });
  
  return UserPreference;
}; 
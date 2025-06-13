const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      // define association here
    }
  }
  
  UserPreference.init({
    preference_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
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
        name: 'preference_key_unique',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'preference_key' }]
      }
    ]
  });
  
  return UserPreference;
}; 
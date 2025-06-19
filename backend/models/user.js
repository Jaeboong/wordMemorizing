const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.WordGroup, { foreignKey: 'user_id', as: 'wordGroups' });
      this.hasMany(models.TestResult, { foreignKey: 'user_id', as: 'testResults' });
      this.hasMany(models.UserPreference, { foreignKey: 'user_id', as: 'preferences' });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kakaoId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: '카카오 사용자 ID'
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: '사용자 닉네임'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '마지막 로그인 시간'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  });
  
  return User;
}; 
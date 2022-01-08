import {Sequelize} from 'sequelize';

class User extends Model {}
User.init(
  {
    username: DataTypes.STRING,
    birthday: DataTypes.DATE,
  },
  { sequelize, modelName: 'user' },
);

export default (sequelize: Sequelize) => {

}

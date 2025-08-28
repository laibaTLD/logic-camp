import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Attributes interface
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  isActive: boolean;
  isApproved: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Creation attributes: id, createdAt, updatedAt are optional
export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

// Model class
class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  // Declare fields so TS knows they exist
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "user";
  public isActive!: boolean;
  public isApproved!: boolean;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations placeholder
  public static associate(models: any) {
    // Example:
    // User.hasMany(models.Project, { foreignKey: "userId" });
  }
}

// Initialize the model
export const initUser = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { len: [1, 100] },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "users",
      timestamps: true, // createdAt & updatedAt handled automatically
      indexes: [
        { fields: ["email"], unique: true },
        { fields: ["role"] },
        { fields: ["isActive"] },
        { fields: ["isApproved"] },
      ],
    }
  );
};

export { User };
export default User;

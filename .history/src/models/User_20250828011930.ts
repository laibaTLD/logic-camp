const { Model, DataTypes } = require("sequelize");

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
  extends Omit<UserAttributes, "id" | "createdAt" | "updatedAt"> {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Model class
class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: "admin" | "user";
  declare isActive: boolean;
  declare isApproved: boolean;

  // Timestamps added by Sequelize automatically
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations placeholder
  public static associate(models: any) {
    // This will be called after all models are initialized
  }
}

// Initialize the model
export const initUser = (sequelize: any) => {
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
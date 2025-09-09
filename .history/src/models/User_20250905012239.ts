import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

// Attributes interface
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "employee" | "teamLead";
  isActive: boolean;
  isApproved: boolean;
  avatarUrl?: string;
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
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: "admin" | "employee" | "teamLead";
  declare isActive: boolean;
  declare isApproved: boolean;
  declare avatarUrl?: string;

  // timestamps
   declare readonly createdAt: Date;
   declare readonly updatedAt: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
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
        type: DataTypes.ENUM("admin", "employee", "teamLead"),
        allowNull: false,
        defaultValue: "employee",
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
      avatarUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: true,
        },
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

import { Model, DataTypes, Sequelize } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from './index';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
  isActive: boolean;
  lastLoginAt?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public avatar?: string;
  public role!: 'admin' | 'manager' | 'member';
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public emailVerified!: boolean;
  public emailVerificationToken?: string;
  public passwordResetToken?: string;
  public passwordResetExpires?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  public async hashPassword(): Promise<void> {
    if (this.changed('password')) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    return values;
  }
}

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
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true,
      },
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user: User) => {
        await user.hashPassword();
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default User;

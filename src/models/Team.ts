import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

interface TeamAttributes {
  id: number;
  name: string;
  description: string;
  avatar?: string;
  isActive: boolean;
  maxMembers?: number;
  ownerId: number;
  settings: {
    allowMemberInvites: boolean;
    allowProjectCreation: boolean;
    allowTaskAssignment: boolean;
    notificationPreferences: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamCreationAttributes extends Omit<TeamAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  settings?: TeamAttributes['settings'];
}

class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public avatar?: string;
  public isActive!: boolean;
  public maxMembers?: number;
  public ownerId!: number;
  public settings!: {
    allowMemberInvites: boolean;
    allowProjectCreation: boolean;
    allowTaskAssignment: boolean;
    notificationPreferences: {
      email: boolean;
      push: boolean;
      slack: boolean;
    };
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public canAddMember(): boolean {
    if (!this.maxMembers) return true;
    // This would need to be calculated based on actual member count
    // For now, return true if maxMembers is not set
    return true;
  }

  public getDefaultSettings() {
    return {
      allowMemberInvites: true,
      allowProjectCreation: true,
      allowTaskAssignment: true,
      notificationPreferences: {
        email: true,
        push: true,
        slack: false,
      },
    };
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    values.canAddMember = this.canAddMember();
    return values;
  }
}

Team.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
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
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 1000,
      },
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        allowMemberInvites: true,
        allowProjectCreation: true,
        allowTaskAssignment: true,
        notificationPreferences: {
          email: true,
          push: true,
          slack: false,
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    hooks: {
      beforeValidate: (team: Team) => {
        if (!team.settings) {
          team.settings = team.getDefaultSettings();
        }
      },
    },
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['ownerId'],
      },
      {
        fields: ['isActive'],
      },
    ],
  }
);

export default Team;

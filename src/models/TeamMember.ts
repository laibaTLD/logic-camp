import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

interface TeamMemberAttributes {
  id: number;
  userId: number;
  teamId: number;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'viewer';
  joinedAt: Date;
  invitedBy?: number;
  invitationStatus: 'pending' | 'accepted' | 'declined';
  permissions: {
    canInviteMembers: boolean;
    canCreateProjects: boolean;
    canAssignTasks: boolean;
    canEditTeamSettings: boolean;
    canRemoveMembers: boolean;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TeamMemberCreationAttributes extends Omit<TeamMemberAttributes, 'id' | 'createdAt' | 'updatedAt' | 'joinedAt'> {
  joinedAt?: Date;
  permissions?: TeamMemberAttributes['permissions'];
}

class TeamMember extends Model<TeamMemberAttributes, TeamMemberCreationAttributes> implements TeamMemberAttributes {
  public id!: number;
  public userId!: number;
  public teamId!: number;
  public role!: 'owner' | 'admin' | 'moderator' | 'member' | 'viewer';
  public joinedAt!: Date;
  public invitedBy?: number;
  public invitationStatus!: 'pending' | 'accepted' | 'declined';
  public permissions!: {
    canInviteMembers: boolean;
    canCreateProjects: boolean;
    canAssignTasks: boolean;
    canEditTeamSettings: boolean;
    canRemoveMembers: boolean;
  };
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public getDefaultPermissions(): TeamMemberAttributes['permissions'] {
    switch (this.role) {
      case 'owner':
        return {
          canInviteMembers: true,
          canCreateProjects: true,
          canAssignTasks: true,
          canEditTeamSettings: true,
          canRemoveMembers: true,
        };
      case 'admin':
        return {
          canInviteMembers: true,
          canCreateProjects: true,
          canAssignTasks: true,
          canEditTeamSettings: true,
          canRemoveMembers: false,
        };
      case 'moderator':
        return {
          canInviteMembers: true,
          canCreateProjects: true,
          canAssignTasks: true,
          canEditTeamSettings: false,
          canRemoveMembers: false,
        };
      case 'member':
        return {
          canInviteMembers: false,
          canCreateProjects: true,
          canAssignTasks: true,
          canEditTeamSettings: false,
          canRemoveMembers: false,
        };
      case 'viewer':
        return {
          canInviteMembers: false,
          canCreateProjects: false,
          canAssignTasks: false,
          canEditTeamSettings: false,
          canRemoveMembers: false,
        };
      default:
        return {
          canInviteMembers: false,
          canCreateProjects: false,
          canAssignTasks: false,
          canEditTeamSettings: false,
          canRemoveMembers: false,
        };
    }
  }

  public hasPermission(permission: keyof TeamMemberAttributes['permissions']): boolean {
    return this.permissions[permission] || false;
  }

  public canManageMember(memberRole: string): boolean {
    const roleHierarchy = {
      'owner': 5,
      'admin': 4,
      'moderator': 3,
      'member': 2,
      'viewer': 1
    };
    
    return roleHierarchy[this.role as keyof typeof roleHierarchy] > roleHierarchy[memberRole as keyof typeof roleHierarchy];
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    values.hasPermission = this.hasPermission.bind(this);
    values.canManageMember = this.canManageMember.bind(this);
    return values;
  }
}

TeamMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('owner', 'admin', 'moderator', 'member', 'viewer'),
      allowNull: false,
      defaultValue: 'member',
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    invitedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    invitationStatus: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      allowNull: false,
      defaultValue: 'accepted',
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        canInviteMembers: false,
        canCreateProjects: false,
        canAssignTasks: false,
        canEditTeamSettings: false,
        canRemoveMembers: false,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'team_members',
    timestamps: true,
    hooks: {
      beforeValidate: (member: TeamMember) => {
        if (!member.permissions) {
          member.permissions = member.getDefaultPermissions();
        }
        if (!member.joinedAt) {
          member.joinedAt = new Date();
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ['userId', 'teamId'],
      },
      {
        fields: ['teamId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['invitationStatus'],
      },
    ],
  }
);

export default TeamMember;

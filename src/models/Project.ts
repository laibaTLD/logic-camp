import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

interface ProjectAttributes {
  id: number;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  dueDate: Date;
  completedAt?: Date;
  budget?: number;
  ownerId: number;
  teamId: number;
  tags?: string[];
  progress: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProjectCreationAttributes extends Omit<ProjectAttributes, 'id' | 'createdAt' | 'updatedAt' | 'progress'> {
  progress?: number;
}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public status!: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public startDate!: Date;
  public dueDate!: Date;
  public completedAt?: Date;
  public budget?: number;
  public ownerId!: number;
  public teamId!: number;
  public tags?: string[];
  public progress!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public calculateProgress(): number {
    if (this.status === 'completed') return 100;
    if (this.status === 'planning') return 0;
    
    // This would typically be calculated based on completed tasks
    // For now, return the stored progress
    return this.progress;
  }

  public isOverdue(): boolean {
    return new Date() > this.dueDate && this.status !== 'completed';
  }

  public getDaysRemaining(): number {
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    values.progress = this.calculateProgress();
    values.isOverdue = this.isOverdue();
    values.daysRemaining = this.getDaysRemaining();
    return values;
  }
}

Project.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [3, 200],
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
    status: {
      type: DataTypes.ENUM('planning', 'active', 'on-hold', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
        isAfterStartDate(value: Date) {
          if (value <= this.startDate) {
            throw new Error('Due date must be after start date');
          }
        },
      },
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
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
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teams',
        key: 'id',
      },
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
    hooks: {
      beforeValidate: (project: Project) => {
        if (project.status === 'completed' && !project.completedAt) {
          project.completedAt = new Date();
        }
      },
    },
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['priority'],
      },
      {
        fields: ['ownerId'],
      },
      {
        fields: ['teamId'],
      },
      {
        fields: ['dueDate'],
      },
    ],
  }
);

export default Project;

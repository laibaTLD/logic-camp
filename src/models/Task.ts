import { Model, DataTypes } from 'sequelize';
import { sequelize } from './index';

interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'feature' | 'bug' | 'improvement' | 'documentation' | 'testing';
  estimatedHours?: number;
  actualHours?: number;
  dueDate: Date;
  completedAt?: Date;
  projectId: number;
  assignedToId?: number;
  createdById: number;
  tags?: string[];
  attachments?: string[];
  comments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface TaskCreationAttributes extends Omit<TaskAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  estimatedHours?: number;
  actualHours?: number;
  assignedToId?: number;
  tags?: string[];
  attachments?: string[];
  comments?: string[];
}

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public status!: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public type!: 'feature' | 'bug' | 'improvement' | 'documentation' | 'testing';
  public estimatedHours?: number;
  public actualHours?: number;
  public dueDate!: Date;
  public completedAt?: Date;
  public projectId!: number;
  public assignedToId?: number;
  public createdById!: number;
  public tags?: string[];
  public attachments?: string[];
  public comments?: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public isOverdue(): boolean {
    return new Date() > this.dueDate && this.status !== 'completed';
  }

  public getDaysRemaining(): number {
    const now = new Date();
    const due = new Date(this.dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getProgressPercentage(): number {
    switch (this.status) {
      case 'pending': return 0;
      case 'in-progress': return 25;
      case 'review': return 75;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  }

  public getTimeVariance(): number | null {
    if (!this.estimatedHours || !this.actualHours) return null;
    return this.actualHours - this.estimatedHours;
  }

  public toJSON(): any {
    const values = Object.assign({}, this.get());
    values.isOverdue = this.isOverdue();
    values.daysRemaining = this.getDaysRemaining();
    values.progressPercentage = this.getProgressPercentage();
    values.timeVariance = this.getTimeVariance();
    return values;
  }
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
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
      type: DataTypes.ENUM('pending', 'in-progress', 'review', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
    },
    type: {
      type: DataTypes.ENUM('feature', 'bug', 'improvement', 'documentation', 'testing'),
      allowNull: false,
      defaultValue: 'feature',
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 999.99,
      },
    },
    actualHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 999.99,
      },
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        notEmpty: true,
      },
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id',
      },
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    comments: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    hooks: {
      beforeValidate: (task: Task) => {
        if (task.status === 'completed' && !task.completedAt) {
          task.completedAt = new Date();
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
        fields: ['projectId'],
      },
      {
        fields: ['assignedToId'],
      },
      {
        fields: ['createdById'],
      },
      {
        fields: ['dueDate'],
      },
      {
        fields: ['type'],
      },
    ],
  }
);

export default Task;

import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface GoalAttributes {
  id: number;
  title: string;
  description?: string;
  statuses?: Array<{
    id: number;
    title: string;
    description?: string;
    color: string;
  }> | null;
  status_title: string;
  project_id: number;
  deadline?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoalCreationAttributes
  extends Optional<GoalAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'deadline' | 'statuses' | 'status_title'> {}

class Goal extends Model<GoalAttributes, GoalCreationAttributes>
  implements GoalAttributes {
  // Fields
  declare id: number;
  declare title: string;
  declare description?: string;
  declare statuses?: Array<{
    id: number;
    title: string;
    description?: string;
    color: string;
  }> | null;
  declare status_title: string;
  declare project_id: number;
  declare deadline?: Date;

  // timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Associations placeholder
  public static associate(models: any) {
    // These associations are set up in the main index.ts file
    // This method is kept for compatibility but associations are handled centrally
  }
}

export const initGoal = (sequelize: Sequelize) => {
  Goal.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          len: [1, 150],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      statuses: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of status objects with title, description, and color'
      },
      status_title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'todo',
        comment: 'Current status title'
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      deadline: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'goals',
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ['project_id'] },
        { fields: ['status_title'] },
        { fields: ['deadline'] },
      ],
    }
  );
};

export { Goal };
export default Goal;
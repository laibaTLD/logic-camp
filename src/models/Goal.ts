import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface GoalAttributes {
  id: number;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'testing' | 'completed';
  project_id: number;
  deadline?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GoalCreationAttributes
  extends Optional<GoalAttributes, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'deadline'> {}

class Goal extends Model<GoalAttributes, GoalCreationAttributes>
  implements GoalAttributes {
  // Fields
  declare id: number;
  declare title: string;
  declare description?: string;
  declare status: 'todo' | 'inProgress' | 'testing' | 'completed';
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
      status: {
        type: DataTypes.ENUM('todo', 'inProgress', 'testing', 'completed'),
        allowNull: false,
        defaultValue: 'todo',
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
        { fields: ['status'] },
        { fields: ['deadline'] },
      ],
    }
  );
};

export { Goal };
export default Goal;
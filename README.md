# MyTeamCamp - Team Management Application

A modern team management application built with Next.js 15, PostgreSQL, and Sequelize.

## Features

- **User Management**: Authentication, authorization, and user profiles
- **Project Management**: Create, track, and manage projects
- **Task Management**: Assign tasks, track progress, and manage deadlines
- **Team Collaboration**: Team creation, member management, and communication
- **Real-time Notifications**: Stay updated with project and task changes
- **Modern UI**: Built with Tailwind CSS and React 19

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod schema validation

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm (recommended) or npm

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logic-camp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example env.local
   ```
   
   Edit `env.local` with your database credentials:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/myteamcamp
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=myteamcamp
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   NODE_ENV=development
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE myteamcamp;
   CREATE USER myteamcamp_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE myteamcamp TO myteamcamp_user;
   ```

5. **Initialize the database**
   ```bash
   pnpm run db:init
   ```

## Development

1. **Start the development server**
   ```bash
   pnpm dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Management

- **Initialize database**: `pnpm run db:init`
- **Run migrations**: `pnpm run db:migrate`
- **Seed database**: `pnpm run db:seed`
- **Reset database**: `pnpm run db:reset`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project by ID
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task by ID
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `GET /api/teams/[id]` - Get team by ID
- `PUT /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project endpoints
│   │   ├── tasks/         # Task endpoints
│   │   └── teams/         # Team endpoints
│   ├── components/        # React components
│   ├── features/          # Feature-based components
│   └── styles/            # Global styles
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── database.ts       # Database configuration
│   └── init-db.ts        # Database initialization
├── models/                # Sequelize models
│   ├── User.ts           # User model
│   ├── Project.ts        # Project model
│   ├── Task.ts           # Task model
│   ├── Team.ts           # Team model
│   ├── TeamMember.ts     # Team member junction
│   ├── Message.ts        # Message model
│   ├── Notification.ts   # Notification model
│   └── index.ts          # Models index
└── types/                 # TypeScript type definitions
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 5432 |
| `DB_NAME` | Database name | myteamcamp |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `NODE_ENV` | Environment mode | development |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

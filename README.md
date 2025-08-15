# MyTeamCamp - Team Management Application

A modern, full-stack team management application built with Next.js 15, PostgreSQL, and Sequelize. This application provides comprehensive project and task management capabilities with real-time collaboration features.

## 🚀 Features

### Core Features
- **User Management**: Secure authentication with JWT, role-based access control
- **Team Management**: Create and manage teams with customizable permissions
- **Project Management**: Full project lifecycle from planning to completion
- **Task Management**: Comprehensive task tracking with assignments and progress
- **Real-time Communication**: Team messaging and notifications
- **Dashboard**: Intuitive dashboard with project overview and analytics

### Technical Features
- **Modern Stack**: Next.js 15 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API**: RESTful API with comprehensive validation and error handling
- **Security**: Helmet.js security headers, CORS protection
- **Logging**: Structured logging with different levels and contexts
- **Validation**: Zod schema validation for all inputs

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React 19**: Latest React features

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database
- **Sequelize**: Object-Relational Mapping (ORM)
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Nodemon**: Development server with auto-restart

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** 18+ installed
- **PostgreSQL** 12+ installed and running
- **pnpm** package manager (or npm/yarn)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd myteamcamp
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myteamcamp_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 4. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE myteamcamp_db;
```

### 5. Run Database Migrations

```bash
pnpm run db:migrate
```

### 6. Seed Database (Optional)

```bash
pnpm run db:seed
```

### 7. Start the Application

#### Development Mode
```bash
pnpm run dev
```

#### Production Mode
```bash
pnpm run build
pnpm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🗄️ Database Schema

### Core Tables

#### Users
- Authentication and profile information
- Role-based access control (admin, manager, member)
- Email verification and password reset capabilities

#### Teams
- Team management with customizable settings
- Member roles and permissions
- Team-specific project organization

#### Projects
- Project lifecycle management
- Status tracking and progress monitoring
- Budget and timeline management

#### Tasks
- Comprehensive task management
- Assignment and progress tracking
- Time estimation and actual time tracking

#### Team Members
- Junction table for team memberships
- Role-based permissions within teams
- Invitation and acceptance workflow

#### Notifications
- User notification system
- Different notification types and priorities
- Actionable notifications with metadata

#### Messages
- Team communication system
- File and link sharing capabilities
- Message reactions and threading

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/change-password` - Password change

### Projects
- `GET /api/projects` - List projects with filtering and pagination
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks with filtering and pagination
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Health Checks
- `GET /health` - Application health status
- `GET /health/db` - Database connection status

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "member",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Role Hierarchy
1. **Admin**: Full system access
2. **Manager**: Team and project management
3. **Member**: Basic project and task access
4. **Viewer**: Read-only access

### Permission System
- **Team Level**: Invite members, manage team settings
- **Project Level**: Create, edit, and delete projects
- **Task Level**: Assign, update, and complete tasks
- **Communication**: Send messages and notifications

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

### Test Coverage
```bash
pnpm test:coverage
```

## 📊 Monitoring & Logging

### Log Levels
- **ERROR**: Application errors and failures
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Detailed debugging information

### Log Contexts
- **Request/Response**: HTTP request logging
- **Database**: Database operation logging
- **Authentication**: User authentication events
- **Performance**: Operation timing and metrics

## 🚀 Deployment

### Production Environment
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure CORS origins
5. Set up SSL/TLS certificates

### Docker Deployment
```bash
# Build Docker image
docker build -t myteamcamp .

# Run container
docker run -p 3001:3001 myteamcamp
```

### Environment Variables
- `NODE_ENV`: Application environment
- `PORT`: Server port
- `DB_*`: Database configuration
- `JWT_*`: JWT configuration
- `LOG_LEVEL`: Logging level

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document new features
- Follow conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **Database Connection**: Check PostgreSQL service and credentials
- **Port Conflicts**: Ensure ports 3000 and 3001 are available
- **Dependencies**: Clear node_modules and reinstall

### Getting Help
- Check the [Issues](issues) page
- Review the [Wiki](wiki) for detailed guides
- Contact the development team

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- User authentication and management
- Project and task management
- Team collaboration features
- RESTful API with comprehensive validation

---

**Built with ❤️ using modern web technologies**

# MyTeamCamp Setup Guide

This guide will help you set up the MyTeamCamp application with PostgreSQL and Sequelize.

## Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL 12+** - Download from [postgresql.org](https://postgresql.org/)
3. **pnpm** (recommended) or npm

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Set Up PostgreSQL

1. **Install PostgreSQL** on your system
2. **Start PostgreSQL service**
3. **Create database and user**:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE myteamcamp;

-- Create user (optional, you can use postgres user)
CREATE USER myteamcamp_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE myteamcamp TO myteamcamp_user;

-- Exit psql
\q
```

## Step 3: Configure Environment Variables

1. **Copy environment template**:
   ```bash
   cp env.example env.local
   ```

2. **Edit env.local** with your database credentials:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/myteamcamp
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=myteamcamp
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters
   NODE_ENV=development
   ```

## Step 4: Initialize Database

```bash
# Initialize database schema
pnpm run db:init

# Seed with sample data
pnpm run db:seed

# Or do both at once
pnpm run db:reset
```

## Step 5: Test the Setup

```bash
# Test database connection and models
pnpm run test:db
```

## Step 6: Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 7: Test the Application

1. **Register a new user** or use the seeded accounts:
   - Admin: `admin@myteamcamp.com` / `admin123`
   - User: `john@myteamcamp.com` / `user123`

2. **Test API endpoints**:
   - Health check: `GET /api/health`
   - Register: `POST /api/auth/register`
   - Login: `POST /api/auth/login`

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL service**:
   ```bash
   # Windows
   net start postgresql-x64-15
   
   # macOS/Linux
   sudo systemctl start postgresql
   ```

2. **Verify connection details** in `env.local`

3. **Test connection manually**:
   ```bash
   psql -U postgres -d myteamcamp -h localhost
   ```

### Port Conflicts

If port 3000 is busy:
```bash
pnpm dev --port 3001
```

### Permission Issues

On Windows, run PowerShell as Administrator if you encounter permission issues.

## API Testing

Use tools like Postman or curl to test the API:

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Development Workflow

1. **Make changes** to models, API routes, or components
2. **Test changes** with `pnpm run test:db`
3. **Restart dev server** if needed: `pnpm dev`
4. **Check API endpoints** in browser or with tools

## Production Deployment

1. **Set NODE_ENV=production**
2. **Use strong JWT_SECRET**
3. **Configure production database**
4. **Set up SSL certificates**
5. **Use environment-specific configurations**

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify database connection
3. Check environment variables
4. Ensure all dependencies are installed
5. Verify PostgreSQL is running

## Next Steps

After successful setup:
1. Explore the API endpoints
2. Customize the frontend components
3. Add new features to the models
4. Implement additional business logic
5. Add tests for your code

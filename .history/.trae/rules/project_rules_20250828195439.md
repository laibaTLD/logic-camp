# Project Rules - Software Development

## Project Setup & Structure

- Use a consistent project structure across similar projects
- Include a comprehensive .gitignore file from project start
- Set up automated dependency vulnerability scanning
- Configure CI/CD pipeline before first production deployment
- Create development, staging, and production environments
- Use Docker for consistent development environments
- Set up logging and monitoring from day one

## Code Architecture & Design

- Follow SOLID principles in object-oriented code
- Use design patterns appropriately, not excessively
- Implement clean architecture with clear separation of concerns
- Keep business logic separate from framework-specific code
- Use dependency injection for better testability
- Implement proper error boundaries and graceful degradation
- Design for scalability from the beginning

## Database & Data Management

- Use migrations for all database schema changes
- Never edit production data directly - always use scripts
- Implement proper indexing strategy
- Use database transactions for data consistency
- Backup data regularly and test restore procedures
- Document data models and relationships
- Follow database naming conventions consistently

## API Design & Integration

- Follow RESTful principles or GraphQL best practices
- Version APIs from the first release
- Implement proper HTTP status codes and error responses
- Use consistent request/response formats
- Implement rate limiting and authentication
- Document all endpoints with examples
- Use API testing tools for validation

## Configuration & Environment Management

- Use environment-specific configuration files
- Never hardcode environment-specific values
- Implement feature flags for gradual rollouts
- Use secrets management solutions for sensitive data
- Document all environment variables and their purposes
- Implement configuration validation on startup
- Use infrastructure as code for deployment environments

## Monitoring & Observability

- Implement structured logging with consistent format
- Set up application performance monitoring (APM)
- Create health check endpoints for all services
- Monitor key business metrics, not just technical metrics
- Set up alerting for critical failures
- Implement distributed tracing for microservices
- Create dashboards for system observability

## Deployment & Release Management

- Use automated deployment pipelines
- Implement blue-green or rolling deployments
- Create rollback procedures for failed deployments
- Use semantic versioning for all releases
- Maintain a changelog for each release
- Test deployments in staging environment first
- Implement database migration strategies

## Team Collaboration & Communication

- Use consistent branch naming and merge strategies
- Implement code review requirements for all changes
- Create templates for pull requests and issues
- Document team agreements and coding standards
- Use project management tools to track progress
- Conduct regular retrospectives and planning sessions
- Maintain team knowledge base and runbooks

## Performance & Optimization

- Set performance budgets for key metrics
- Implement caching strategies at appropriate layers
- Optimize database queries and avoid N+1 problems
- Use CDN for static assets
- Implement lazy loading where appropriate
- Monitor and optimize bundle sizes for web applications
- Profile applications regularly to identify bottlenecks

## Security Implementation

- Implement security scanning in CI/CD pipeline
- Use HTTPS/TLS for all communications
- Implement proper input validation and output encoding
- Follow OWASP security guidelines
- Implement audit logging for sensitive operations
- Use secure session management
- Regular security reviews and penetration testing

## Maintenance & Technical Debt

- Schedule regular dependency updates
- Allocate 20% of development time to technical debt
- Document known issues and workarounds
- Refactor code when adding new features to existing modules
- Remove unused code and dependencies regularly
- Monitor and address performance regressions
- Keep development and production environments in sync
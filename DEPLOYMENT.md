# Deployment & CI/CD Setup

This project uses multiple layers of testing and validation before deployment to ensure code quality.

## 🚀 Deployment Pipeline

### 1. Local Development (Pre-commit Hooks)
- **Linting**: ESLint checks code style and catches errors
- **Type Checking**: TypeScript compiler validates types
- **Tests**: Jest runs all unit and integration tests

### 2. GitHub Actions CI/CD
- **Triggers**: Runs on push to `main`/`develop` and all pull requests
- **Matrix Testing**: Tests against Node.js 18.x and 20.x
- **Coverage**: Generates test coverage reports
- **Build Validation**: Ensures the app builds successfully
- **Sequential Jobs**: Tests must pass before build, build must pass before deployment

### 3. Vercel Deployment
- **Automated**: Only deploys to production after all tests and build pass
- **Environment Variables**: Securely managed through Vercel dashboard
- **Preview Deployments**: Every PR gets a preview deployment after tests pass
- **Production**: Automatic deployment on merge to main (only after CI passes)

## 🛠️ Setup Instructions

### GitHub Repository Setup

1. **Enable GitHub Actions** (if not already enabled):
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Ensure "Allow all actions and reusable workflows" is selected

2. **Add Repository Secrets**:
   Go to Settings → Secrets and variables → Actions, and add:
   ```
   DATABASE_URL=your_database_url
   CODECOV_TOKEN=your_codecov_token (optional)
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_org_id
   VERCEL_PROJECT_ID=your_project_id
   ```

### Vercel Setup

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Environment Variables**:
   Add the same environment variables in Vercel dashboard:
   - `DATABASE_URL`

3. **Build Settings**:
   Vercel will automatically use the `vercel.json` configuration which includes:
   - Build Command: `prisma generate && next build`
   - Install Command: `npm ci`

4. **Get Vercel Integration Secrets**:
   Required for GitHub Actions deployment:
   - **Token**: Vercel Dashboard → Settings → Tokens
   - **Org ID**: Vercel Dashboard → Settings → General  
   - **Project ID**: Project Settings → General

## 📋 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database
```

## 🔍 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Utility function testing
- API route testing

### Integration Tests
- Database operations
- API endpoint validation
- Form submission flows

### Coverage Requirements
- Minimum 80% code coverage
- All critical paths must be tested
- New features require corresponding tests

## 🚨 Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations are ready
- [ ] Environment variables are configured
- [ ] Feature has been tested in preview deployment

## 🔧 Troubleshooting

### Tests Failing in CI
1. Check if all dependencies are installed
2. Verify environment variables are set
3. Ensure database is accessible (if using real DB in tests)

### Build Failing on Vercel
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally with `npm run build`

### Pre-commit Hooks Not Running
1. Ensure Husky is installed: `npx husky install`
2. Check hook permissions: `chmod +x .husky/pre-commit`
3. Verify Git hooks are enabled

## 📊 Monitoring

- **GitHub Actions**: Monitor CI/CD pipeline status
- **Vercel Analytics**: Track deployment success/failure
- **Codecov**: Monitor test coverage trends (if configured)
# BetterMeet

A modern scheduling application with automatic timezone handling and mobile-optimized interface.

## Features

- 🌍 Automatic timezone detection and conversion
- 📱 Mobile-first responsive design
- ⚡ Built with Next.js 14+ and App Router
- 🎨 Modern UI with HeroUI components
- 🗄️ PostgreSQL database with Prisma ORM
- 🧪 Comprehensive testing setup

## Tech Stack

- **Frontend**: Next.js 14+, React 18, TypeScript
- **UI Framework**: HeroUI (formerly NextUI) with Tailwind CSS
- **Database**: PostgreSQL (Neon.tech) with Prisma ORM
- **Timezone Handling**: date-fns-tz
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (recommend Neon.tech)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bettermeet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database connection string and other configuration.

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── __tests__/      # Page tests
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── providers.tsx   # App providers
├── lib/                # Utility libraries
│   ├── __tests__/      # Library tests
│   ├── prisma.ts       # Database client
│   └── timezone.ts     # Timezone utilities
prisma/
└── schema.prisma       # Database schema
```

## Database Schema

The application uses PostgreSQL with the following main entities:

- **Polls**: Scheduling polls with title, description, and timezone
- **TimeSlots**: Available time slots for each poll
- **Participants**: Users who respond to polls
- **Availability**: Participant responses for each time slot

## Deployment

This project includes a comprehensive CI/CD pipeline with automated testing and deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed setup instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bettermeet)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Run linting (`npm run lint`)
7. Submit a pull request

All pull requests are automatically tested via GitHub Actions before merge.

## License

This project is licensed under the MIT License.
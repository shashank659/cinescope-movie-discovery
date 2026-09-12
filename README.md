# CineScope — Full-Stack Movie Discovery App

CineScope is a full-stack movie discovery web application designed to solve the "cold-start" media exploration challenge. Users can browse curated movie collections without needing a specific title in mind, search by title with instant feedback, explore movies by genre, inspect comprehensive film details, and manage persistent, user-isolated Watchlist and Favorites catalogs.

The project is architected as an npm workspaces monorepo featuring a decoupled Express REST backend proxy, a cinematic React frontend, Prisma ORM with SQLite database persistence, and secure HTTP-only cookie-based authentication.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Assignment Requirements Covered](#2-assignment-requirements-covered)
3. [Key Features](#3-key-features)
4. [Technology Stack](#4-technology-stack)
5. [Architecture and Data Flow](#5-architecture-and-data-flow)
6. [Important Technical Decisions](#6-important-technical-decisions)
7. [TMDB API Integration](#7-tmdb-api-integration)
8. [Database Design](#8-database-design)
9. [Project Structure](#9-project-structure)
10. [Setup Instructions](#10-setup-instructions)
11. [Environment Variables](#11-environment-variables)
12. [Available Scripts](#12-available-scripts)
13. [Testing and Verification](#13-testing-and-verification)
14. [Security Considerations](#14-security-considerations)
15. [Assumptions](#15-assumptions)
16. [Known Limitations](#16-known-limitations)
17. [Future Improvements](#17-future-improvements)
18. [AI Transparency](#18-ai-transparency)
19. [What I Would Improve With More Time](#19-what-i-would-improve-with-more-time)
20. [License](#20-license)

---

## 1. Project Overview

Media discovery applications often assume users already know what they want to watch. CineScope is built specifically for open-ended browsing:

- **Browse & Discover**: Discover titles without searching. The homepage spotlights a featured film in a cinematic hero banner, interactive genre badges, and five horizontal discovery shelves (Trending, Popular, Top Rated, Now Playing in Theatres, and Upcoming).
- **Search**: Search across the movie catalog with live query parameters, pagination, and zero-state guidance.
- **Deep Film Details**: Review synopses, runtimes, release years, vote averages, production budgets, box office revenues, and genres.
- **Save & Track**: Authenticated users can save titles to personal Watchlist and Favorites lists backed by persistent SQLite storage.

---

## 2. Assignment Requirements Covered

The table below maps the assignment requirements to their actual implementation in this repository. Items that are partially implemented are labeled honestly with their exact scope and limitations.

| Assignment Requirement | Status | Implementation Details & Limitations |
| :--- | :--- | :--- |
| **Movie Browsing / Discovery** | **Implemented** | Homepage provides instant discovery without requiring a search query: featured hero banner, 5 horizontal movie shelves (Trending, Popular, Top Rated, Now Playing, Upcoming), and quick-access genre badges. |
| **Movie Search** | **Implemented** | Dedicated `/search` page and navigation search input querying `/api/movies/search?query=...` via the backend proxy with query parameter synchronization. |
| **Categories / Genres** | **Implemented** | Dynamic genre list fetched from `/api/movies/genres`, rendered as interactive exploration badges on the homepage and genre chips on movie details pages. |
| **Ordering / Sorting or Discovery Sections** | **Implemented / Partial** | **Implemented**: Browsing is organized into 5 distinct categorized discovery sections ordered by TMDB's ranking algorithms (velocity, popularity, vote score, release date).<br>**Limitation**: Interactive client-side sorting controls (e.g. dropdown to sort search results dynamically by release year or rating) are not implemented. |
| **Pagination or Continued Exploration** | **Implemented / Partial** | **Implemented**: Search results feature full multi-page pagination controls (Previous / Next with total page count), and homepage shelves feature horizontal carousel scrolling.<br>**Limitation**: Continuous infinite scrolling with Intersection Observer is not implemented. |
| **Movie Details** | **Implemented** | Dynamic route `/movie/:id` displaying high-res backdrop, poster, tagline, overview, runtime (formatted in hours/mins), release year, vote score, budget, revenue, and Watchlist/Favorite action buttons. |
| **Persistent Wishlist / Watchlist** | **Implemented** | Dedicated user-isolated Watchlist (`/watchlist`) and Favorites (`/favorites`) persisted in SQLite via Prisma with compound unique constraints (`userId`, `movieId`) preventing duplicate entries. `/wishlist` redirects to `/watchlist`. |
| **Backend Abstraction over External API** | **Implemented** | Express backend acts as the single gateway to TMDB. TMDB API keys/tokens are stored strictly in server environment variables and never exposed to the client. |
| **Loading, Empty, and Error States** | **Implemented** | Shimmer skeleton cards (`MovieCardSkeleton`), contextual zero-result empty states (`EmptyState`), informative error boundaries with retry buttons (`ErrorState`), and missing image fallbacks (`PosterFallback`). |
| **Responsive Design** | **Implemented** | Dark cinematic UI styled with Tailwind CSS, supporting mobile devices (collapsible navigation drawer, touch scrolling) up to wide desktop screens. |
| **Authentication & User Data Isolation** | **Implemented** | User registration and login using bcrypt password hashing, signed JWTs stored strictly in HTTP-only cookies (no tokens in JSON responses or `localStorage`), and per-user query isolation. |
| **API Caching & Request Deduplication** | **Implemented / Partial** | **Implemented**: TanStack React Query handles client-side caching (`staleTime: 2 minutes`) and deduplication for the active browser session.<br>**Limitation**: Server-side caching (e.g. Redis or in-memory cache) is not implemented. |
| **Request Cancellation (AbortController)** | **Not Implemented** | **Limitation**: In-flight HTTP requests are not actively cancelled via `AbortController` when a user rapidly modifies a search query. |
| **Rate-Limit & Large Result Handling** | **Implemented / Partial** | **Implemented**: Backend detects TMDB `429 Too Many Requests` responses and propagates a clean 429 status code. TMDB paginated responses (page 1 to total_pages) are normalized.<br>**Limitation**: Exponential backoff retry queues and large-result local indexing are not implemented. |

---

## 3. Key Features

- **Cinematic Hero Spotlight**: Dynamically features a top trending film on the homepage with high-resolution artwork, synopsis, vote rating, and direct navigation.
- **Horizontal Movie Shelves**: Five curated shelves for Weekly Trending, Popular Releases, Top Rated Classics, Now Playing in Theatres, and Upcoming Releases with horizontal carousel controls.
- **Genre Exploration Badges**: Browse movies categorized by official TMDB genres directly from the discovery view.
- **Search Experience**: Dedicated search page with query parameter URL synchronization (`?q=...`), multi-page navigation, and empty-state guidance.
- **Comprehensive Movie Details**: Dedicated film view showing runtime (formatted in hours and minutes), release year, budget, box office revenue, production status, and genre pills.
- **User Authentication**: Secure signup, login, session verification (`/api/auth/me`), and logout (`/api/auth/logout`) via secure HTTP-only cookies.
- **Watchlist & Favorites Management**: Save and remove titles with instant status checks (`/:movieId/check`) and optimistic React Query updates.
- **Protected Routes**: Client-side route protection (`<ProtectedRoute>`) redirecting unauthenticated users to `/login` with location state preserved so they return to their intended destination upon login.
- **Resilient UI States**: Shimmer skeleton cards during data fetching, fallback placeholders for missing poster assets, and contextual error states with retry buttons.

---

## 4. Technology Stack

### Frontend (`apps/web`)
- **React** (`^18.3.1`): Component-based UI library
- **TypeScript** (`^5.7.3`): Static typing and contract enforcement
- **Vite** (`^6.1.0`): Development server and production bundler
- **Tailwind CSS** (`^3.4.17`): Utility-first CSS styling
- **React Router DOM** (`^6.28.2`): Declarative client-side routing
- **TanStack React Query** (`^5.66.0`): Server-state management, caching, and mutations
- **Lucide React** (`^0.475.0`): Icon library
- **Vitest** (`^3.2.7`) & **React Testing Library** (`^16.3.3`): Component testing

### Backend (`apps/api`)
- **Node.js** & **Express** (`^4.21.2`): REST API server
- **TypeScript** (`^5.7.3`): Type safety across the server runtime
- **Prisma ORM** (`^6.4.1`): Database schema modeling and type-safe queries
- **SQLite**: Local relational database
- **Zod** (`^3.24.2`): Schema definition and request validation
- **bcryptjs** (`^3.0.3`): Password hashing
- **jsonwebtoken** (`^9.0.3`): Cryptographic JWT creation and verification
- **cookie-parser** (`^1.4.7`): Express cookie middleware
- **cors** (`^2.8.5`): Cross-origin resource sharing
- **dotenv** (`^16.4.7`): Environment variable loader
- **Vitest** (`^3.0.5`) & **Supertest** (`^7.0.0`): API route integration testing

### Monorepo & Shared (`packages/shared`)
- **npm Workspaces**: Monorepo orchestration
- **@cinescope/shared**: Common TypeScript types (`MovieSummary`, `MovieDetails`, `UserResponse`, `PaginatedResults`) shared between backend and frontend.

---

## 5. Architecture and Data Flow

### Movie Discovery Flow
```
[ React Frontend (apps/web) ]
          │
          ▼  GET /api/movies/*
[ Express Backend (apps/api) ]
          │  1. Validates query / params with Zod
          │  2. Injects TMDB_API_READ_ACCESS_TOKEN into Authorization header
          ▼  GET https://api.themoviedb.org/3/*
[ TMDB External API ]
          │
          ▼  Raw TMDB Response
[ Express Backend ]
          │  3. Normalizes fields (poster paths, nulls, camelCase)
          │  4. Handles upstream status codes
          ▼  JSON MovieSummary / MovieDetails
[ React Frontend ]
          │  5. Caches response via TanStack Query
          ▼  Renders UI
```

### Authenticated User Data Flow
```
[ React Frontend ]
          │
          ▼  Cookie: token=<jwt> (credentials: 'include')
[ Express Backend ]
          │  1. cookie-parser extracts cookie
          │  2. requireAuth middleware verifies JWT & populates req.user
          │  3. Validates payload with Zod
          ▼  Prisma Query (where: { userId: req.user.id })
[ SQLite Database (dev.db) ]
          │
          ▼  User-isolated records
[ Express Backend ]
          │  4. Sanitizes response (excludes passwordHash and token)
          ▼  JSON UserProfile / ListItems
[ React Frontend ]
```

> **Architectural Boundary**: The frontend never communicates with TMDB directly. The Express backend serves as a secure proxy and abstraction layer, insulating the client from external API shifts and safeguarding credentials.

---

## 6. Important Technical Decisions

1. **Backend as a Secure Proxy**: Storing TMDB API credentials on the server ensures tokens cannot be inspected or exfiltrated through client network tools. The client interacts exclusively with standard `/api/movies/*` routes.
2. **HTTP-Only Cookies vs. localStorage**: Storing JWTs in `localStorage` leaves tokens vulnerable to direct exfiltration via cross-site scripting (XSS). CineScope stores JWTs in HTTP-only, SameSite cookies that client-side JavaScript cannot read. While HTTP-only cookies do not eliminate all XSS hazards (such as unauthorized actions dispatched from an existing session), they eliminate direct credential exfiltration, providing a substantially safer posture than `localStorage`.
3. **Prisma ORM with SQLite**: Prisma provides end-to-end type safety for database access and automatically generates migrations. SQLite allows the project to run locally without requiring external database servers or complex containers.
4. **Data Normalization Layer**: TMDB returns snake_case attributes and occasional missing values. The backend normalizes all movie entities into predictable TypeScript models with default fallbacks before sending them to the client.
5. **Shared TypeScript Contracts**: Defining types in `@cinescope/shared` prevents schema drift between the backend API and frontend views.
6. **Compound Database Constraints**: Watchlist and Favorite models enforce `@@unique([userId, movieId])` at the database level, making duplicate entries structurally impossible.

---

## 7. TMDB API Integration

The backend TMDB service (`apps/api/src/services/tmdb.service.ts`) encapsulates all interactions with the external movie API.

- **Base URL**: `https://api.themoviedb.org/3`
- **Authentication**: Requests attach an `Authorization: Bearer <token>` header populated from `TMDB_API_READ_ACCESS_TOKEN`.
- **Endpoints Utilized**:
  - `GET /trending/movie/week`: Weekly trending movie discovery
  - `GET /movie/popular`: Popular movie discovery
  - `GET /movie/top_rated`: Top-rated movie discovery
  - `GET /movie/now_playing`: Movies currently in theatres
  - `GET /movie/upcoming`: Upcoming releases
  - `GET /search/movie`: Movie title search
  - `GET /movie/{movie_id}`: Comprehensive movie details
  - `GET /genre/movie/list`: Official movie genre catalog
- **Normalization**:
  - `normalizeMovie()`: Converts raw TMDB movie objects into `MovieSummary` with sanitized poster/backdrop URLs and numeric rating defaults.
  - `normalizeMovieDetails()`: Extends the summary with runtime, budget, revenue, and genre objects.
  - `normalizePaginatedResponse()`: Standardizes paginated payloads (`page`, `results`, `totalPages`, `totalResults`).
- **Error Propagation**:
  - `401 / 403` -> `502 Bad Gateway` (TMDB credential error)
  - `404` -> `404 Not Found` (movie resource does not exist)
  - `429` -> `429 Too Many Requests` (upstream rate limit exceeded)
  - `500+` -> `502 Bad Gateway` (upstream provider failure)
- **Validation**: Query parameters and route IDs are validated using Zod middleware before making upstream requests.

---

## 8. Database Design

The SQLite database schema is defined in `apps/api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String      @id @default(cuid())
  email        String      @unique
  passwordHash String
  name         String
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  watchlist    Watchlist[]
  favorites    Favorite[]
}

model Watchlist {
  id          String   @id @default(cuid())
  userId      String
  movieId     Int
  movieTitle  String
  posterPath  String?
  releaseDate String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, movieId])
  @@index([userId])
}

model Favorite {
  id          String   @id @default(cuid())
  userId      String
  movieId     Int
  movieTitle  String
  posterPath  String?
  releaseDate String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, movieId])
  @@index([userId])
}
```

### Data Split Strategy
- **Stored Locally in SQLite**: User credentials, password hashes, and lightweight movie references (`movieId`, `movieTitle`, `posterPath`, `releaseDate`) to render user lists without redundant external API requests.
- **Retrieved On-Demand from TMDB**: Full movie overviews, backdrops, cast/crew, genres, runtime, budget, revenue, and vote averages.

---

## 9. Project Structure

```text
cinescope-movie-discovery/
├── apps/
│   ├── api/                              # Backend Express Application
│   │   ├── prisma/
│   │   │   ├── migrations/               # Prisma migration history
│   │   │   └── schema.prisma             # Database schema
│   │   ├── src/
│   │   │   ├── config/                   # Environment & Prisma client
│   │   │   ├── controllers/              # Request handlers (auth, movies, lists)
│   │   │   ├── middlewares/              # Auth, error, and logger middlewares
│   │   │   ├── routes/                   # Express routers
│   │   │   ├── services/                 # TMDB, Auth, and UserList services
│   │   │   ├── validators/               # Zod validation schemas
│   │   │   ├── __tests__/                # Vitest backend test suites
│   │   │   ├── app.ts                    # Express app configuration
│   │   │   └── server.ts                 # Server entry point
│   │   ├── .env.example
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   │
│   └── web/                              # Frontend React Application
│       ├── src/
│       │   ├── components/               # UI components (Hero, Shelves, Navbar, States)
│       │   ├── context/                  # React AuthContext
│       │   ├── pages/                    # Home, Search, Details, Watchlist, Favorites, Auth
│       │   ├── services/                 # API clients (authApi, movieApi, userListApi)
│       │   ├── test/                     # Test setup and mocks
│       │   ├── __tests__/                # Vitest frontend component test suites
│       │   ├── App.tsx                   # Route definitions
│       │   └── main.tsx                  # React entry point
│       ├── .env.example
│       ├── package.json
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── vitest.config.ts
│
├── packages/
│   └── shared/                           # Shared Types Package
│       ├── src/
│       │   ├── types/                    # TypeScript contracts (movie, auth, health)
│       │   └── index.ts                  # Package entry point
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                          # Monorepo root configuration
├── package-lock.json
├── tsconfig.base.json
└── README.md
```

---

## 10. Setup Instructions

### Prerequisites
- **Node.js**: `v18.x` or higher (`v20+` recommended)
- **npm**: `v9.x` or higher
- **TMDB Account**: A free account from [TheMovieDB.org](https://www.themoviedb.org/) with an API Read Access Token (v4 Bearer token).

### Step 1: Clone Repository & Install Dependencies
```bash
git clone https://github.com/shashank659/cinescope-movie-discovery.git
cd cinescope-movie-discovery
npm install
```

### Step 2: Configure Environment Variables
Copy the template file to create your local `.env`:
```bash
# On Windows PowerShell:
Copy-Item apps/api/.env.example apps/api/.env

# On macOS / Linux:
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and supply your TMDB API Read Access Token and a secure JWT secret (see [Section 11](#11-environment-variables) for details).

### Step 3: Run Database Migrations
Initialize the SQLite database and generate the Prisma client:
```bash
npm --workspace=apps/api run prisma:migrate
```

### Step 4: Run the Application
Launch both backend and frontend development servers concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 11. Environment Variables

Environment variables are managed in `apps/api/.env`. A template is provided in `apps/api/.env.example`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"

# TMDB API Read Access Token (Bearer token for TMDB API endpoints)
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here

# JWT Authentication
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=7d
```

### Variable Breakdown

| Variable | Required | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | Port on which the Express server listens. | `5000` |
| `NODE_ENV` | Optional | Application runtime environment (`development`, `test`, `production`). | `development` |
| `DATABASE_URL` | Required | Connection string for SQLite database. | `"file:./dev.db"` |
| `TMDB_API_READ_ACCESS_TOKEN` | Required | TMDB v4 API Read Access Token (Bearer token). Obtained from your TMDB account settings. | *(None — must be supplied)* |
| `JWT_SECRET` | Required | Secret string (minimum 16 characters) used to sign and verify JWT authentication cookies. | *(Must be supplied in production)* |
| `JWT_EXPIRES_IN` | Optional | Expiration window for signed JWT authentication tokens. | `7d` |

> **Security Notice**: Never commit `apps/api/.env` or `.env.local` to version control. Both are excluded via `.gitignore`.

---

## 12. Available Scripts

Run these scripts from the repository root:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both backend (`dev:api`) and frontend (`dev:web`) concurrently using `concurrently`. |
| `npm run dev:api` | Starts the Express server using `tsx watch` with live reloading on port 5000. |
| `npm run dev:web` | Starts the Vite dev server with proxy support on port 5173. |
| `npm run build` | Compiles `@cinescope/shared`, `@cinescope/api`, and `@cinescope/web` for production. |
| `npm run build:shared` | Compiles shared TypeScript types. |
| `npm run build:api` | Compiles the backend API via TypeScript (`tsc`). |
| `npm run build:web` | Compiles the frontend application via Vite (`tsc && vite build`). |
| `npm run typecheck` | Performs TypeScript type checking (`tsc --noEmit`) across all workspaces. |
| `npm test` | Executes both backend and frontend test suites via Vitest. |
| `npm run test:api` | Runs backend unit and integration tests (42 tests). |
| `npm run test:web` | Runs frontend component and page tests (26 tests). |

Workspace-specific database commands:
```bash
# Generate Prisma Client
npm --workspace=apps/api run prisma:generate

# Run development migrations
npm --workspace=apps/api run prisma:migrate
```

---

## 13. Testing and Verification

The test suite covers backend endpoints, middleware, authentication flows, and frontend UI components:

```text
Backend Tests (Vitest + Supertest):
  ✓ apps/api/src/__tests__/auth.test.ts (11 tests)
  ✓ apps/api/src/__tests__/movies.test.ts (18 tests)
  ✓ apps/api/src/__tests__/tmdb.test.ts (5 tests)
  ✓ apps/api/src/__tests__/userList.test.ts (8 tests)
  Total: 42 passed (100%)

Frontend Tests (Vitest + React Testing Library):
  ✓ apps/web/src/__tests__/FavoritesPage.test.tsx (2 tests)
  ✓ apps/web/src/__tests__/HeroBanner.test.tsx (3 tests)
  ✓ apps/web/src/__tests__/LoginPage.test.tsx (2 tests)
  ✓ apps/web/src/__tests__/MovieCard.test.tsx (3 tests)
  ✓ apps/web/src/__tests__/MovieDetailsPage.test.tsx (4 tests)
  ✓ apps/web/src/__tests__/Navbar.test.tsx (4 tests)
  ✓ apps/web/src/__tests__/ProtectedRoute.test.tsx (2 tests)
  ✓ apps/web/src/__tests__/RegisterPage.test.tsx (2 tests)
  ✓ apps/web/src/__tests__/SearchPage.test.tsx (2 tests)
  ✓ apps/web/src/__tests__/WatchlistPage.test.tsx (2 tests)
  Total: 26 passed (100%)

Overall: 68 passed tests | 0 typecheck errors | Production build clean
```

---

## 14. Security Considerations

- **Server-Side Credential Storage**: TMDB Read Access Tokens are stored solely in backend environment variables and accessed in server memory. The client never handles third-party API credentials.
- **HTTP-Only Cookies**: JWTs are set with `httpOnly: true`, `sameSite: 'lax'`, and `secure: false` (in development; `true` in production). This prevents client-side JavaScript from reading or extracting session tokens via script injection, though general XSS protections (input sanitization and output encoding) remain essential against in-session unauthorized actions.
- **Sanitized Auth Responses**: Auth endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/me`) return only sanitized user profiles (`id`, `email`, `name`). JWTs and password hashes are never included in JSON response bodies.
- **Bcrypt Password Hashing**: Passwords are encrypted using bcrypt with a salt round of 10 before saving to SQLite.
- **Input Validation & Sanitization**: All route parameters, queries, and request bodies are validated with strict Zod schemas, returning `400 Bad Request` with structured error messages upon malformed inputs.
- **User Data Isolation**: Watchlist and Favorites queries are always scoped to `req.user.id`, preventing cross-account access or ID tampering.
- **Git Protection**: `.env`, `.env.local`, SQLite databases (`*.db`, `*.db-journal`), and build outputs are ignored by Git.

---

## 15. Assumptions

1. **TMDB as Primary Provider**: TMDB v3/v4 is assumed to be the single source of truth for global movie metadata, poster imagery, and genre definitions.
2. **Hybrid Persistence Model**: Full movie metadata is fetched on demand from TMDB, while minimal reference attributes (`movieId`, `movieTitle`, `posterPath`, `releaseDate`) are stored in SQLite for fast list rendering.
3. **Authentication Boundary**: Browsing and searching movies is public. Managing Watchlist and Favorites strictly requires user authentication.
4. **Development Environment**: SQLite is assumed as the zero-configuration database driver for local development.

---

## 16. Known Limitations

- **Curated Sections vs. Dynamic Sorting**: While browsing includes 5 categorized discovery sections (Trending, Popular, Top Rated, Now Playing, Upcoming), on-the-fly client sorting dropdowns (e.g. sorting search results by release date or rating) are not implemented.
- **No Server-Side Caching**: Outgoing TMDB requests are not cached in Redis or memory. Repeated requests rely on TanStack Query's client-side cache (`staleTime: 2 minutes`).
- **No Request Cancellation**: Rapid typing in the search bar does not trigger `AbortController` cancellation for in-flight TMDB queries, though input submission is debounced/controlled.
- **SQLite Concurrency**: SQLite is suitable for single-instance local execution but is not designed for multi-tenant high-throughput production deployment.
- **Pagination Model**: Search results use standard page-number pagination; continuous infinite scrolling is not implemented.

---

## 17. Future Improvements

- **Redis Cache Layer**: Add a server-side Redis cache with configurable TTLs for TMDB endpoints (e.g. 1 hour for trending/popular, 24 hours for movie details) to reduce external API consumption.
- **Search AbortController**: Integrate `AbortController` into `movieApi.ts` and Express to immediately cancel obsolete search requests when users alter queries.
- **Dynamic Sorting Controls**: Add sorting dropdowns on the search and discovery pages (e.g., sort by release date descending, rating descending, popularity).
- **PostgreSQL Migration**: Swap SQLite for PostgreSQL with connection pooling (e.g. Supabase, AWS RDS) for production deployments.
- **Infinite Scrolling**: Implement `useInfiniteQuery` on the search view with an Intersection Observer sentinel.
- **Trailer & Video Embeds**: Integrate TMDB's `/movie/{id}/videos` endpoint to render embedded YouTube trailers directly on movie details pages.

---

## 18. AI Transparency

AI-assisted development tools were used to understand documentation, generate and refine boilerplate, troubleshoot issues, review implementation details, and improve the UI. The final architecture, feature decisions, security decisions, testing, and verification were reviewed during development, and the implementation is intended to be explainable and maintainable.

---

## 19. What I Would Improve With More Time

1. **Client-Side Sorting & Filters**: Add interactive filter controls to search and shelf views (filter by minimum rating score, release year range, or runtime).
2. **Infinite Scroll for Catalogs**: Replace page-by-page buttons on the search view with smooth infinite scrolling using TanStack Query's `useInfiniteQuery`.
3. **Enhanced Movie Details**: Add movie cast carousels, director credits, similar movie recommendations, and official trailer previews.
4. **Automated CI/CD**: Set up a GitHub Actions workflow to run linting, typechecking, and test suites across all monorepo workspaces on pull requests.
5. **Dark/Light Theme Toggle**: Implement user-selectable aesthetic themes.

---

## 20. License

This project was developed as a technical assessment for the Full-Stack Intern Assignment. All rights belong to the repository author. Movie data and imagery are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).

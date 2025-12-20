# 🎬 Movie Critic

A modern movie review application built with Next.js, allowing users to browse movies, write reviews, and share their opinions about films.

## ✨ Features

- **Movie Discovery**: Browse popular movies powered by The Movie Database (TMDB) API
- **Movie Details**: View comprehensive information about movies including cast, ratings, and synopsis
- **User Reviews**: Read and write reviews for movies
- **User Authentication**: Secure login and signup functionality
- **User Profiles**: Manage your account and view your review history
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Modern UI**: Beautiful interface built with shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Backend**: [Pocketbase](https://pocketbase.io)
- **API**: [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api)
- **Icons**: [Lucide React](https://lucide.dev)
- **Package Manager**: pnpm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org) (v18 or higher)
- [pnpm](https://pnpm.io) package manager
- [Pocketbase](https://pocketbase.io) instance running

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_POCKETBASE_URL=your_pocketbase_url_here
```

**How to get these:**
- **TMDB API Key**: Sign up at [TMDB](https://www.themoviedb.org/) and request an API key from your account settings
- **Pocketbase URL**: Set up a Pocketbase instance locally or use a hosted solution

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-critic
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Create a `.env.local` file with the required variables (see above)

4. **Set up Pocketbase**
   - Download and run Pocketbase
   - Configure the necessary collections for reviews and users
   - Update the `NEXT_PUBLIC_POCKETBASE_URL` with your instance URL

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
movie-critic/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── movies/            # Movies listing page
│   ├── movie/[id]/        # Movie detail page
│   ├── profile/           # User profile page
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions and helpers
│   └── api/              # API integration utilities
├── public/               # Static assets
└── CLAUDE.md            # Developer guidelines
```

## 💻 Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Development Guidelines

Please refer to [CLAUDE.md](./CLAUDE.md) for detailed development guidelines, including:
- Next.js best practices (Server Components by default)
- UI component usage (shadcn/ui components)
- Development workflow
- Common tasks

### Adding UI Components

This project uses shadcn/ui. To add a new component:

```bash
pnpm dlx shadcn@latest add <component-name>
```

## 🤝 Contributing

1. Follow the guidelines in [CLAUDE.md](./CLAUDE.md)
2. Use Server Components by default; only add `'use client'` when necessary
3. Use shadcn/ui components for all UI elements
4. Maintain code consistency and follow Next.js app router conventions

## 📄 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [TMDB](https://www.themoviedb.org) - Movie database and API
- [Pocketbase](https://pocketbase.io) - Backend solution
- [shadcn/ui](https://ui.shadcn.com) - UI component library

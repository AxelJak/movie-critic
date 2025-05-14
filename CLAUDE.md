# Movie Critic App - Developer Guide

## Project Structure
- `/app`: Next.js pages using app router
- `/components/ui`: Shared UI components
- `/lib`: Utility functions and helpers
- `/lib/api`: API routes for Pocketbase interactions

## Key Technologies
- Next.js for frontend
- Tailwind CSS for styling
- Shadcn UI components
- Pocketbase for backend

## Development Workflow
1. Start dev server: `pnpm dev`
2. Access local site: http://localhost:3000

## Common tasks
- Add shadcn component if missing: `pnpm dlx shadcn@latest add <component>`

## API Integration
- TMDB API base URL: located in `.env`
- Environment variables should be set in `.env`

## Other instructions
- Always make an inital plan and get approval from user before starting to edit
- Important, do not guess functionallity of the app if unsure check

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

## Development Guidelines

### Next.js Best Practices
- **IMPORTANT: Always use Server Components by default** unless client-side interactivity is required
- Only add `'use client'` directive when necessary (forms, event handlers, hooks, browser APIs)
- Leverage server-side data fetching for better performance
- Follow Next.js app router conventions and patterns
- Use proper file-based routing structure

### UI Components
- **CRITICAL: Always use shadcn/ui components for all UI elements**
- Check existing components in `/components/ui` before creating custom ones
- Maintain design consistency by using shadcn components throughout the app
- If a needed shadcn component is missing, add it using: `pnpm dlx shadcn@latest add <component>`
- Do not create custom UI components that replicate shadcn functionality

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

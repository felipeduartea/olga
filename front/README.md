# Olga Frontend

Medical management platform built with Next.js and TypeScript.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
front/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── Dashboard.tsx
│   │   ├── DoctorSidebar.tsx
│   │   ├── FollowUps.tsx
│   │   └── Patients.tsx
│   ├── styles/          # Global styles
│   └── index.css        # Main CSS file
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind configuration
└── package.json         # Dependencies
```

## Features

- 📊 Dashboard with statistics
- 👥 Patient management
- 📅 Appointments tracking
- 📋 Follow-ups management
- 🎨 Modern, responsive UI
- 🌙 Dark mode support (ready)
- ♿ Accessible components

## Development

This project uses:
- **Next.js App Router** for routing and layouts
- **Server Components** by default for better performance
- **Client Components** (marked with `'use client'`) for interactivity
- **Path aliases** (`@/*` → `src/*`) for cleaner imports

## Migration Notes

This project was migrated from Vite + React to Next.js:
- ✅ Vite configuration removed
- ✅ Next.js App Router configured
- ✅ All components compatible with Next.js
- ✅ Tailwind CSS v4 with PostCSS plugin
- ✅ TypeScript configured
- ✅ Path aliases maintained

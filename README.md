# IKEA Field Service Scheduler

An intelligent Field Service Management (FSM) platform designed for IKEA furniture assembly and delivery operations. This application facilitates seamless task allocation, real-time scheduling, and map-based tracking between Dispatchers (Admins) and field Assemblers.

## Features

- **Real-time Data Synchronization:** Powered by Supabase Realtime (WebSocket) to instantly reflect task state changes across all clients.
- **Map-based Routing & Tracking:** Interactive map interface using Leaflet to monitor assembler locations and task sites.
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, Dispatchers, and Assemblers.
- **Strict FSM Workflow:** Enforces a robust state machine for tasks (Created → Assigned → En Route → In Progress → Completed → Verified).
- **Responsive PWA:** Optimized for both desktop and mobile environments.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Backend & Auth:** Supabase (PostgreSQL, PostGIS, Row Level Security)
- **State Management:** Zustand (with Optimistic UI & Realtime integrations)
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix UI
- **Maps:** Leaflet & react-leaflet

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build and Production

To create an optimized production build:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## Documentation

For a deep dive into the system architecture, database schema, edge proxy optimizations, and known hydration safety patterns (e.g., `suppressHydrationWarning`), please refer to the [Architecture Overview](./architecture_overview.md).

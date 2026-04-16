# State of the Project: GMAO / PDR Engine
**Date:** April 15, 2026
**Target Audience:** Enterprise Architecture Team

This document provides a comprehensive, deeply technical analysis of the current state of the GMAO (Gestion de Maintenance Assistée par Ordinateur) / PDR (Pièces de Rechange) Engine. It outlines the architectural decisions, tech stack, data schemas, and current development progress.

---

## 1. Tech Stack & Environment

The project is built on a modern, highly reactive frontend stack designed for desktop-first enterprise applications.

*   **Core Framework:** React 18 with TypeScript, bundled via Vite (ESM-based, lightning-fast HMR).
*   **State Management:** 
    *   **Zustand:** Used for global, decoupled UI state (specifically the OS-like window/tab management).
    *   **Dexie.js & `dexie-react-hooks`:** A robust wrapper around IndexedDB used for local-first, offline-capable data persistence and reactive UI updates (`useLiveQuery`).
*   **Styling Engine:** Tailwind CSS v4, utilizing custom CSS variables for dynamic theming.
*   **Animation & Motion:** `motion/react` (Framer Motion) for fluid, OS-level transitions, micro-interactions, and layout animations.
*   **UI Primitives:** Radix UI (`@radix-ui/react-dialog`, `dropdown-menu`, `tabs`) for accessible, unstyled headless components.
*   **Iconography:** `lucide-react` for consistent, scalable SVG icons.

---

## 2. Directory Architecture (FSD/DDD)

The codebase follows a hybrid Feature-Sliced Design (FSD) and Domain-Driven Design (DDD) approach, ensuring that business logic is strictly encapsulated within its respective domain.

```text
src/
├── app/                  # Application Shell & Global Providers
│   ├── DesktopLayout.tsx # The main OS-like window manager and sidebar
│   └── store.ts          # Zustand global stores (e.g., useTabStore)
├── core/                 # Core Infrastructure & Data Layer
│   └── db.ts             # Dexie.js database initialization and schemas
├── features/             # Domain-Driven Modules (The Business Logic)
│   ├── auth/             # Authentication & Login Screen (Windows 11 style)
│   ├── pdr-engine/       # Core Spare Parts Engine (Dashboard, Inventory, Details)
│   ├── procurement/      # Purchase Orders & Vendor Management
│   ├── settings/         # System Settings, DB Management, User Management
│   └── terminal/         # Simulated Kernel/CLI access for System Admins
├── shared/               # Cross-domain Utilities & UI Components
│   ├── components/       # Reusable UI (e.g., GlassCard.tsx)
│   └── utils.ts          # Helper functions (e.g., `cn` for Tailwind merge)
├── index.css             # Global styles and CSS variables (Theming)
└── main.tsx              # React entry point
```

---

## 3. Data Layer & Schemas

The application currently operates in a **Local-First** architecture using IndexedDB (via Dexie.js). The database (`CIOB_GMAO_DB`) is currently at Version 3.

### TypeScript Interfaces & Dexie Schemas

**1. Spare Parts (`spareParts`)**
*   *Schema:* `++id, partNumber, name, quantity, location`
*   *Interface:*
    ```typescript
    export interface SparePart {
      id?: number;
      partNumber: string;
      name: string;
      description: string;
      quantity: number;
      minThreshold: number;
      location: string;
      updatedAt: Date;
    }
    ```

**2. Stock Movements (`stockMovements`)**
*   *Schema:* `++id, partId, type, date`
*   *Interface:*
    ```typescript
    export interface StockMovement {
      id?: number;
      partId: number;
      type: 'IN' | 'OUT';
      quantity: number;
      reason: string;
      date: Date;
    }
    ```

**3. Users (`users`)**
*   *Schema:* `++id, name, role, isPrimary`
*   *Interface:*
    ```typescript
    export interface User {
      id?: number;
      name: string;
      role: string;
      initials: string;
      color: string;
      pin: string;
      isPrimary?: boolean; // Used to designate the un-deletable Super Admin
    }
    ```

---

## 4. UI/UX & The "OS-Like" Shell

The application completely bypasses traditional web layouts in favor of a **Desktop-First, OS-like Shell**.

*   **Liquid Glass Styling (`GlassCard.tsx`):** The UI heavily relies on a "Frosted Glass" aesthetic. This is achieved using Tailwind's `backdrop-blur`, semi-transparent backgrounds (`bg-white/5`, `bg-black/20`), and subtle borders (`border-[var(--glass-border)]`).
*   **Chrome-like Tabs:** Implemented in `DesktopLayout.tsx`. Users don't "navigate" between pages; they open modules in tabs. The tabs feature active states, close buttons, and smooth layout transitions.
*   **Windows 11-style Login:** The `LoginScreen.tsx` features a centralized clock, blurred abstract backgrounds, and a PIN-based user selection grid, mimicking a modern desktop lock screen.
*   **System Terminal:** A dedicated `TerminalView.tsx` provides a simulated CLI for the Super Admin, complete with command history, auto-scrolling, and simulated kernel load metrics.

---

## 5. Core Logic & State Hooks

The business logic is decoupled from the UI using custom hooks and Zustand.

*   **`useTabStore` (Zustand):** Manages the entire routing mechanism. 
    *   State: `tabs` (array of open modules), `activeTabId`.
    *   Actions: `openTab` (prevents duplicates, focuses existing), `closeTab` (smart fallback to the previous tab), `setActiveTab`.
*   **Dexie Live Queries (`useLiveQuery`):** Instead of manually fetching data, components subscribe to database queries. For example, in `SettingsView.tsx`, `useLiveQuery(() => db.users.toArray())` ensures the user list instantly updates when a new user is added or deleted, without requiring a manual state refresh.
*   **Authentication Seeding:** The `LoginScreen` contains a robust `useEffect` that seeds the initial database with default users (including the `System Admin`) and actively cleans up any accidental duplicates to maintain database integrity.

---

## 6. Current Progress vs. Gaps

### Fully Functional (Production-Ready)
*   **Authentication Flow:** PIN-based login, user selection, and secure routing.
*   **OS Layout:** The Sidebar, Tab Manager, and Footer are fully operational.
*   **System Settings:** 
    *   **User Management:** Full CRUD operations for users (add, edit, delete), restricted to the Primary Admin.
    *   **Data Management:** Ability to export the entire IndexedDB to a JSON file, and a secure "Clear Database" function with transaction safety.
*   **Terminal:** Interactive CLI with basic commands (`help`, `status`, `whoami`, `clear`).

### Partial Implementation (Stubs & Mocks)
*   **PDR Dashboard (`PDRDashboard.tsx`):** The layout and Stat Cards are built, but the "Inventory Activity" chart is an empty placeholder (`<div className="border-dashed...">`). Data is currently hardcoded.
*   **Procurement (`ProcurementView.tsx`):** The UI is highly polished (search, filters, status badges), but the `orders` array is statically defined. It needs to be wired to a new Dexie table (e.g., `purchaseOrders`).
*   **Inventory List & Part Details:** The routing exists, but full CRUD operations for `SparePart` and `StockMovement` need to be thoroughly connected to the UI.

### Architectural Gaps to Address
1.  **Cloud Synchronization:** The app is currently 100% local (`DEXIE_LOCAL`). A sync engine (e.g., Firebase, Supabase, or a custom REST API) needs to be implemented to sync IndexedDB with a central server.
2.  **Role-Based Access Control (RBAC):** While the Terminal and User Management are restricted to `isPrimary`, a more granular RBAC system is needed for standard users vs. managers.
3.  **Data Validation:** Zod or Yup should be introduced to validate data before it enters the Dexie database.

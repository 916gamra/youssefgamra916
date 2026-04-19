# 🚢 CIOB GMAO v17.0 (TITANIC OS)
**Next-Generation Industrial Operating System**

![Version](https://img.shields.io/badge/version-17.0-cyan.svg)
![Aesthetic](https://img.shields.io/badge/aesthetic-Titan-rose.svg)

> *"An enterprise-grade, offline-first application designed to bridge the gap between industrial harshness and luxurious software engineering."*

## 📖 Table of Contents
- [1. The Engineering Philosophy](#1-the-engineering-philosophy)
- [2. System Architecture](#2-system-architecture)
- [3. Feature Portals (Modules)](#3-feature-portals-modules)
- [4. The Excel Integration Engine](#4-the-excel-integration-engine)
- [5. Project Directory Structure](#5-project-directory-structure)
- [6. Security & Performance](#6-security--performance)
- [7. Getting Started](#7-getting-started)

---

## 1. 🧠 The Engineering Philosophy
TITANIC OS was built with several core philosophical pillars meant to sustain it for the next 10 years without requiring a complete rewrite:

1. **The "Offline-First" Resilience:** Factories and industrial plants often suffer from poor connectivity. The app uses **IndexedDB (Dexie.js)** as an edge-layer cache. Technicians can execute work orders, and managers can approve parts instantly offline. Data syncs with the central server transparently when a connection is restored.
2. **The Titan Design System:** Industrial tools shouldn't be ugly. By employing an aggressive industrial aesthetic with carbon-black surfaces and neon functional accents, we provide a high-clarity interface. This decreases fatigue and increases precision in harsh environments.
3. **Strict Domain-Driven Design (DDD):** Features are heavily isolated into "Engines" (PDR Engine, ShieldOps, Factory Admin). If one module needs to be replaced, it doesn't break the others.
4. **Data Ironclad (Validation at the Gates):** Utilizing **Zod**, no rogue data can enter the system. Whether it's an API payload or an Excel import, the data must comply with the mathematical schema or it is rejected entirely.

---

## 2. 🏛 System Architecture
The application runs on a **Hybrid Full-Stack Architecture**:

### The Edge Layer (Browser/Client)
- **Framework:** React 19 + TypeScript + Vite.
- **State Management:** Zustand (for global states like Tabs/Modals) + Dexie Live Queries (for reactive DB states).
- **Styling:** Tailwind CSS V4 + Framer Motion (for fluid OS-like animations).
- **Performance:** `@tanstack/react-virtual` handles millions of list items without freezing the DOM.

### The Backend Layer (Node.js)
- **Current Paradigm:** We run a Node.js Express server (`server.ts`) under the same roof. 
- **Future-Proofing:** Prepared with `helmet`, `jsonwebtoken`, and `rate-limiter-flexible`. Once the central SQL database is ready, the `syncWithDatabase` hook will stream IndexedDB payloads to the Express routes securely.

---

## 3. 🧩 Feature Portals (Modules)
The application acts as an operating system housing different sub-applications (Portals).

* **📦 PDR Engine (Partes de Rechange):** The Spare Parts master system. 
  - *Data Model:* `Family -> Template -> Blueprint -> Inventory Item`. This hierarchy ensures no duplicate SKUs.
* **🛡 Shield Ops (Preventive Maintenance):** 
  - The tactical center for machine health.
  - Manages `Checklists`, `Schedules`, and `Work Orders` in real-time.
  - Features a temporal logic engine for predictive scheduling based on frequency constraints.
* **🏭 Factory Admin (Organization):**
  - Manages the topological map of the factory (`Sectors -> Machines`).
  - Manages human resources (`Technicians`) and maps them to sectors.
* **🔐 Settings & RBAC:**
  - Role-Based Access Control. Granular portal permissions to separate Engineers from Technicians.

---

## 4. 📊 The Excel Integration Engine
Since legacy data resides in Excel, we built a robust **Excel Hub**:
- **Location:** Present in every Portal (PDR, ShieldOps, Factory).
- **Features:** 
  1. Reads `.xlsx` and maps rows directly to IndexedDB tables.
  2. Creates immutable **Backups** before overwriting data, allowing point-in-time restoration.
  3. Uses `exceljs` to generate dynamic **Templates** equipped with Excel-native Data Validation dropdowns.

---

## 5. 📂 Project Directory Structure

```text
/CIOB_GMAO
├── /src
│   ├── /app               # Core OS Layout (Canvas, Sidebar, Taskbar, Auth Gate)
│   ├── /core              # The Heart (Database, Security, Validation Schemas, Logger)
│   │   ├── db.ts          # Dexie.js Schema configuration
│   │   ├── security.ts    # Bcrypt hashing & crypto algorithms
│   │   ├── logger.ts      # Structured logging & Performance measuring
│   │   ├── schemas.ts     # Zod validation schemas
│   │   └── /excel         # The entire Excel Reader/Writer Engine
│   ├── /features          # Domain-Driven Modules (Isolated domains)
│   │   ├── /auth          # Login Screen and Session Logic
│   │   ├── /pdr-engine    # Part procurement and Inventory module
│   │   ├── /preventive    # ShieldOps Maintenance module
│   │   ├── /factory       # Machines & Technicians organization
│   │   └── /system        # RBAC, User Management, DB actions
│   └── /shared            # Reusable UI Components, Hooks, and Utils
│       ├── /components    # GlassCard, Modal, ExcelManager, etc.
│       ├── /hooks         # useNotifications, useWindowSize
│       └── utils.ts       # Tailwind class mergers (cn)
├── server.ts              # Hybrid Node/Express Server
├── package.json           # Dependencies
├── vite.config.ts         # Bundler config
└── tailwind.css           # Global core styles
```

---

## 6. 🛡 Security & Performance

### Security (Enterprise Grade)
- **Credential Storage:** User PINs are strictly hashed in the browser/server using `bcryptjs`. We never store plaintext passwords.
- **Action Auditing:** All destructive actions require confirmation. (Future: `auditLogs` table).

### Performance Logging
We employ a custom `measureOperation` wrapper mimicking Pino logs.
Whenever an operation executes (e.g., confirming a giant Purchase Order), the wrapper measures execution bounds. If `duration > 1000ms`, it triggers an intensive warning to allow developers to spot bottlenecks automatically.

---

## 7. 🚀 Getting Started

### Prerequisites
- Node.js Version 20.x or 22.x
- NPM / Yarn / PNPM

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Hybrid Development Server (Vite mapped through Express):
   ```bash
   npm run dev
   ```

### Production Build
Ready for deployment to standard VMs, Docker, or App Services.
```bash
npm run build
npm start
```

---
*Architected and Engineered for the Future.* 🚢

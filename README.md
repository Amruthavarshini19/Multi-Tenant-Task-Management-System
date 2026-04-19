# TaskFlow - Multi-Tenant SaaS Enterprise

TaskFlow is a premium, multi-tenant task management platform designed for high-performance teams. Built with a robust **Node.js/Express** backend and a stunning **React** frontend, it utilizes a strict organizational isolation architecture to ensure data security and tenant privacy.

![TaskFlow Dashboard](https://raw.githubusercontent.com/Amruthavarshini19/Multi-Tenant-Task-Management-System/main/frontend/src/assets/hero.png)

## 🚀 Core Features

- **Multi-Tenant Architecture**: Each organization (tenant) operates in a strictly isolated scope. Users only interact with data belonging to their specific organization.
- **Role-Based Access Control (RBAC)**:
  - **Admins**: Global visibility across the organization, ability to manage members, create tasks, and view audit logs.
  - **Members**: Focused execution view, managing only their assigned tasks.
- **Dynamic Kanban Boards**: Advanced sprint board execution with drag-and-drop-ready state management and real-time status updates.
- **Premium SaaS UI**: 
  - **Theme-Awareness**: Full support for Dark and Light modes.
  - **Visual Depth**: Utilizes modern gradients, multi-layer shadows, and glassmorphism.
- **Security & Activity**: 
  - Secure bcrypt-hashed password management.
  - Comprehensive audit logging for administrative oversight.
  - JWT-based authentication with secure session handling.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS v4, Lucide Icons, Vite |
| **Backend** | Node.js, Express, Sequelize ORM |
| **Database** | PostgreSQL (Relational Data), Redis (Caching/Sessions) |
| **Infrastructure** | Docker, Nginx (Reverse Proxy) |

## 📦 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed.
- [Node.js](https://nodejs.org/) (optional for local development).

### Deployment via Docker

The entire platform (PostgreSQL, Redis, Backend, and Nginx) can be launched with a single command:

```bash
# Clone the repository
git clone https://github.com/Amruthavarshini19/Multi-Tenant-Task-Management-System.git
cd Multi-Tenant-Task-Management-System

# Start all services
docker-compose up -d --build
```

The platform will be accessible at:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

### Local Development Setup

If you wish to run the frontend independently:

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Environment Configuration

Copy the `.env.example` to `.env` and configure your local credentials:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=yourpassword
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
```

## 🎨 Design System

TaskFlow uses a custom design system defined in `index.css` that provides:
- **Premium Cards**: Enhanced with shadows and hover-lift effects.
- **Glass-Card Utilities**: For modern translucent surfaces.
- **Dynamic Theming**: Instant switching between dark and light modes without page reloads.

---

Built with ❤️ by [Amruthavarshini19](https://github.com/Amruthavarshini19)

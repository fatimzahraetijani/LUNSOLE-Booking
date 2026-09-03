# LUNSOLE Booking — UML Documentation

This folder contains all UML diagrams for the LUNSOLE Booking project.
All diagrams are written in [Mermaid](https://mermaid.js.org/) and render natively on GitHub, GitLab, and any Mermaid-compatible viewer.

## 📁 Files

| File | Diagram Type | Description |
|------|-------------|-------------|
| [01_entity_relationship.md](./01_entity_relationship.md) | ER Diagram | Database schema: all 6 tables and their relationships |
| [02_class_diagram.md](./02_class_diagram.md) | Class Diagram | Backend architecture: controllers, routes, middleware |
| [03_use_case.md](./03_use_case.md) | Use Case Diagram | Actor interactions: Guest, User, Admin |
| [04_sequence_diagrams.md](./04_sequence_diagrams.md) | Sequence Diagrams | 4 key flows: Register/Login, Search/Book, Admin CRUD, Favorites |
| [05_component_architecture.md](./05_component_architecture.md) | Component Diagram | Full-stack overview: React frontend + Express backend + MySQL |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router, Axios, Leaflet |
| Backend | Node.js, Express.js, JWT, bcrypt |
| Database | MySQL (InnoDB) |
| AI | Google Gemini AI API |
| Auth | JSON Web Tokens (RS256) |

## 📊 Database Tables

- `users` — registered accounts (user / admin roles)
- `accommodations` — hotels, apartments, villas, guesthouses
- `rooms` — rooms within accommodations
- `bookings` — reservations linking users ↔ rooms
- `favorites` — user wishlist of accommodations
- `reviews` — ratings and comments on accommodations

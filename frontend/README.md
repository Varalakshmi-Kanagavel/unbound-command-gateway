# CommandX Frontend

A modern Next.js frontend for the CommandX Command Gateway system.

## Features

- 🔐 API key authentication via localStorage
- 💳 Credit system display
- 🖥️ Terminal-style command console
- 📜 Command history tracking
- 👥 Admin panel for user management
- ⚙️ Rule management with regex validation
- 📊 Audit log viewing
- 🎨 Dark hacker theme with neon accents

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Framer Motion** (animations)
- **React Hot Toast** (notifications)
- **Lucide React** (icons)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_BASE_URL=https://<YOUR-RENDER-URL>
```

Replace `<YOUR-RENDER-URL>` with your deployed backend URL (e.g., `https://commandx-backend.onrender.com`).

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── dashboard/        # Dashboard with credits
│   ├── commands/         # Command terminal
│   ├── history/          # Command history
│   └── admin/            # Admin pages
│       ├── users/       # User creation
│       ├── rules/       # Rule management
│       └── audit/       # Audit logs
├── components/           # Reusable React components
│   ├── Navbar.tsx       # Navigation bar
│   ├── CommandTerminal.tsx
│   ├── Card.tsx
│   └── Badge.tsx
├── utils/               # Utility functions
│   └── api.ts          # API client
├── hooks/               # Custom React hooks
│   └── useAuth.ts     # Authentication hook
└── middleware.ts       # Route protection middleware
```

## Authentication

The app uses API key authentication:

1. User enters API key on `/login`
2. API key is stored in `localStorage` (key: `api_key`)
3. All API requests include `x-api-key` header
4. Middleware protects routes (except `/login`)

## Admin Detection

Admin status is detected by attempting to access the `/audit` endpoint:
- If `GET /audit` returns 200 OK → user is admin
- If it returns 403/401 → user is member

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL (required)

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `NEXT_PUBLIC_API_BASE_URL`
4. Deploy

The frontend will automatically connect to your backend API.

## API Endpoints Used

- `POST /users` - Create user (admin only)
- `GET /credits` - Get user credits
- `POST /commands` - Submit command
- `GET /commands` - Get command history
- `GET /rules` - List rules
- `POST /rules` - Add rule (admin only)
- `GET /audit` - Get audit logs (admin only)

## Styling

The app uses a custom dark theme with:
- Background: `#0b1020`
- Surface: `#0f1724`
- Neon accent: `#00E6A8`
- Ice accent: `#6BE0FF`
- Muted text: `#9AA4B2`

Fonts:
- UI: Inter (Google Fonts)
- Terminal: JetBrains Mono

## License

See LICENSE file in the root directory.


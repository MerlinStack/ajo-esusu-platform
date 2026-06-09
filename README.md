# Ajo/Esusu Platform

Digital Cooperative Savings & Trust — a ROSCA (Rotating Savings and Credit Association) application with role-based access control.

## Tech Stack

- **React 18** — UI library
- **MUI v5** — Component library
- **Zustand** — State management
- **React Router v6** — Client-side routing
- **Vite** — Build tool
- **Firebase** — Auth & Firestore (backend)

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Login

| Role  | Email                         | Password (any) |
|-------|-------------------------------|----------------|
| Admin | amara.okafor@example.com      | anything       |
| Admin | tunde.bakare@example.com      | anything       |
| User  | chidi.eze@example.com         | anything       |
| User  | folake.balogun@example.com    | anything       |

- **Consumer login**: `/login`
- **Admin login**: `/admin/login`

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

## Project Structure

```
src/
├── firebase/          # Firebase config & services
├── hooks/             # Custom hooks (useDataEngine)
├── layouts/           # App shell layout
├── pages/             # ConsumerDashboard, AdminTerminal
├── store/             # Zustand stores (useAppStore, useThemeStore)
├── theme/             # MUI theme config
├── App.jsx            # Router, login screens, entry
└── main.jsx           # ReactDOM entry
```

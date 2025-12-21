# 🔀 MONOREPO → DUOREPO SPLIT PLAN

## Podział Folderów

### **FRONTEND REPO** (PINnode-Brand-Archive)
```
pinnode-frontend/
├── client/
│   ├── src/
│   ├── index.html
│   └── vite.config.ts
├── shared/
│   └── schema.ts (Zod schemas shared)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── .eslintrc.json
├── .prettierrc.json
├── jest.config.js
├── .github/workflows/ci-frontend.yml
└── README.md
```

### **BACKEND REPO** (PINnode-Brand-Archive-backend)
```
pinnode-backend/
├── server/
│   ├── core/ (DI Container, Services)
│   ├── index.ts
│   ├── routes.ts
│   └── ...
├── shared/
│   └── schema.ts (same as frontend)
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .eslintrc.json
├── .prettierrc.json
├── jest.config.js
├── .github/workflows/ci-backend.yml
└── README.md
```

## Key Points
- `shared/schema.ts` będzie w obu (lub sync via npm package)
- Każdy repo ma swoje: package.json, CI/CD, linting
- Frontend: Vercel deploy
- Backend: Render deploy

# 🚀 DEPLOYMENT & PUSH INSTRUCTIONS

## PRE-DEPLOYMENT CHECKLIST

### 1. Lokalna Weryfikacja
```bash
# Frontend
cd frontend
npm run lint
npm run format:check
npm run check
npm test
npm run build

# Backend  
cd ../backend
npm run lint
npm run format:check
npm run check
npm test
npm run build
```

### 2. Git Setup

```bash
# Frontend Repository
cd frontend
git remote add origin https://github.com/Agaslez/PINnode-Brand-Archive.git
git branch -M main
git add .
git commit -m "chore: initial frontend setup with CI/CD"
git push -u origin main

# Backend Repository
cd ../backend
git remote add origin https://github.com/Agaslez/PINnode-Brand-Archive-backend.git
git branch -M main
git add .
git commit -m "chore: initial backend setup with CI/CD"
git push -u origin main
```

### 3. GitHub Secrets Configuration

#### **Frontend Repo Settings** (PINnode-Brand-Archive)
```
Settings → Secrets and variables → Actions
Add these secrets:

VERCEL_TOKEN: <your-vercel-token>
VERCEL_ORG_ID: <your-vercel-org-id>
VERCEL_PROJECT_ID: <your-vercel-project-id>
```

**Get Vercel tokens:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Copy and add to GitHub Secrets

#### **Backend Repo Settings** (PINnode-Brand-Archive-backend)
```
Settings → Secrets and variables → Actions
Add these secrets:

RENDER_API_KEY: <your-render-api-key>
RENDER_SERVICE_ID: <your-render-staging-service-id>
RENDER_PROD_SERVICE_ID: <your-render-production-service-id>
```

**Get Render tokens:**
1. Go to https://dashboard.render.com/api-tokens
2. Create new API key
3. Copy and add to GitHub Secrets

**Find Service IDs:**
1. Go to https://dashboard.render.com/services
2. Click your backend service
3. Service ID in URL: `https://dashboard.render.com/services/srv-XXXXX`

### 4. Branch Protection (Optional but Recommended)

**For both repos:**
```
Settings → Branches → Add rule
Branch name pattern: main

Require checks to pass before merging:
✓ CI - Frontend Quality Gate (frontend repo)
✓ CI - Backend Quality Gate (backend repo)
```

---

## 📋 STRUCTURE AFTER SPLIT

### Frontend Repository
```
PINnode-Brand-Archive/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── shared/
│   └── schema.ts
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── jest.config.js
├── jest.setup.js
├── .github/
│   └── workflows/
│       └── ci-frontend.yml
└── README.md
```

### Backend Repository
```
PINnode-Brand-Archive-backend/
├── server/
│   ├── core/
│   │   ├── container.ts (DI)
│   │   ├── init.ts
│   │   ├── services.ts
│   │   └── interfaces.ts
│   ├── index.ts
│   ├── routes.ts
│   ├── auth.ts
│   ├── database.ts
│   ├── logger.ts
│   └── ... (other services)
├── shared/
│   └── schema.ts
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc.json
├── jest.config.js
├── jest.setup.js
├── .github/
│   └── workflows/
│       └── ci-backend.yml
└── README.md
```

---

## 🔄 WORKFLOW (AFTER DEPLOYMENT)

### Development Flow

```
1. Create feature branch
   git checkout -b feat/new-feature

2. Make changes
   
3. Run linting & tests
   npm run lint:fix
   npm run format
   npm test

4. Commit with message
   git commit -m "feat: add new feature"

5. Push to feature branch
   git push origin feat/new-feature

6. GitHub automatically:
   ✓ Runs CI pipeline (lint → typecheck → test → build)
   ✓ Requires checks to pass
   ✓ Allows PR creation only after passing

7. Create Pull Request on GitHub

8. Code review & approval

9. Merge to main/develop

10. GitHub automatically deploys:
    - Frontend → Vercel (production)
    - Backend → Render (production)
```

---

## 🚨 IMPORTANT: SHARED SCHEMA

Both repos use `shared/schema.ts` for Zod validation.

### Option 1: Duplicate (Simple)
Keep identical copy in both repos - sync manually when needed.

### Option 2: NPM Package (Better)
```bash
# Create separate package
npm init -y -n @pinnode/schema

# Publish to npm
npm publish

# In both repos
npm install @pinnode/schema

# Import
import { brandProjectSchema } from '@pinnode/schema';
```

**Recommendation:** Use Option 1 initially, upgrade to Option 2 as project grows.

---

## ✅ FINAL DEPLOYMENT CHECKLIST

**Before first push to main:**

- [ ] Frontend repo created and cloned
- [ ] Backend repo created and cloned
- [ ] Both have correct GitHub remotes
- [ ] Vercel secrets added to frontend repo
- [ ] Render secrets added to backend repo
- [ ] CI/CD workflows in .github/workflows/
- [ ] ESLint + Prettier configured
- [ ] Jest tests configured
- [ ] Local: `npm run lint` passes
- [ ] Local: `npm run check` passes
- [ ] Local: `npm test` passes
- [ ] Local: `npm run build` succeeds
- [ ] .gitignore properly configured
- [ ] No secrets in code/config

---

## 🚀 GO LIVE

```bash
# Frontend
git push -u origin main
# → GitHub Actions runs
# → If all checks pass → Vercel deploys automatically
# → Available at https://your-domain.vercel.app

# Backend
git push -u origin main
# → GitHub Actions runs
# → If all checks pass → Render deploys automatically
# → Available at https://pinnode-backend.render.com
```

---

## 📊 MONITORING

### Frontend (Vercel)
- Visit: https://vercel.com/dashboard
- Deployments tab shows all deploys
- Analytics available

### Backend (Render)
- Visit: https://dashboard.render.com/services
- Logs available in real-time
- Health checks configured

### GitHub Actions
- Visit: Repository → Actions tab
- All CI runs logged
- Detailed error messages if failed

---

## 🆘 TROUBLESHOOTING

### CI Pipeline Failing?
1. Check GitHub Actions logs
2. Run locally: `npm run lint && npm run check && npm test`
3. Fix issues
4. Push again

### Deployment Not Triggering?
- Verify secrets added correctly
- Check that main/develop branch exists
- Verify workflow file in `.github/workflows/`
- Re-trigger manually from GitHub Actions tab

### Tests Failing?
- Run locally: `npm test`
- Check coverage threshold met
- Fix failing tests before pushing

---

**Status:** ✅ Ready to deploy

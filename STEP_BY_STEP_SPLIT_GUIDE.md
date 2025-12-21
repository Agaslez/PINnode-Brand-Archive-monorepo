# 📋 STEP-BY-STEP SPLIT GUIDE

## PHASE 1: PREPARE LOCAL DIRECTORIES (30 min)

### Step 1.1: Create clean frontend directory
```bash
mkdir -p ~/projects/PINnode-Brand-Archive
cd ~/projects/PINnode-Brand-Archive

# Copy files from current monorepo
cp -r ~/path/to/pinnode-FULL-COMPLETE-TESTING/client ./
cp -r ~/path/to/pinnode-FULL-COMPLETE-TESTING/shared ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/FRONTEND_package.json package.json
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/ESLINTRC_FRONTEND.json .eslintrc.json
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/PRETTIERRC.json .prettierrc.json
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/JEST_FRONTEND.config.js jest.config.js
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/JEST_SETUP.js jest.setup.js
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/CI_FRONTEND.yml .github/workflows/ci-frontend.yml
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/tsconfig.json ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/tailwind.config.ts ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/postcss.config.js ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/components.json ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/vercel.json ./

# Create standard files
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
pnpm-lock.yaml

# Build
dist/
build/
.next/
out/

# Testing
coverage/
.jest/

# Environment
.env
.env.local
.env.*.local

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

cat > README.md << 'EOF'
# PINnode Brand Archive - Frontend

React + TypeScript + Vite frontend for PINnode Brand Archive System.

## Quick Start
```bash
npm install
npm run dev
```

## CI/CD
- ESLint + Prettier checks
- TypeScript type checking
- Jest unit tests
- Vite build
- Auto-deploy to Vercel (main branch)

## Deployment
Push to `main` branch → GitHub Actions → Vercel deployment
EOF

cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "@vite_api_url"
  }
}
EOF
```

### Step 1.2: Create clean backend directory
```bash
mkdir -p ~/projects/PINnode-Brand-Archive-backend
cd ~/projects/PINnode-Brand-Archive-backend

# Copy server files
cp -r ~/path/to/pinnode-FULL-COMPLETE-TESTING/server ./
cp -r ~/path/to/pinnode-FULL-COMPLETE-TESTING/shared ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/BACKEND_package.json package.json
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/ESLINTRC_BACKEND.json .eslintrc.json
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/PRETTIERRC.json .prettierrc.json
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/JEST_BACKEND.config.js jest.config.js
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/JEST_SETUP.js jest.setup.js
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/CI_BACKEND.yml .github/workflows/ci-backend.yml
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/tsconfig.json ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/drizzle.config.ts ./
cp ~/path/to/pinnode-FULL-COMPLETE-TESTING/render.yaml ./

# Create directories
mkdir -p tests/unit tests/integration

# Copy environment template
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./pinnode.db

# API Keys
DEEPSEEK_API_KEY=your-key-here
OPENAI_API_KEY=your-key-here

# Security
JWT_SECRET=generate-with-openssl-rand-base64-32
SESSION_SECRET=generate-with-openssl-rand-base64-32
ENCRYPTION_KEY=generate-with-openssl-rand-base64-32

# External Services
VITE_API_URL=http://localhost:5000
EOF

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
pnpm-lock.yaml

# Build
dist/
build/

# Database
*.db
*.sqlite

# Testing
coverage/
.jest/

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

cat > README.md << 'EOF'
# PINnode Brand Archive - Backend API

Express + TypeScript + SOLID backend for PINnode Brand Archive System.

## Quick Start
```bash
npm install
npm run dev
```

## API
- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- POST /api/complete-product-export - Generate brand package
- GET /api/health - Health check
- 30+ more endpoints (see routes.ts)

## CI/CD
- ESLint + Prettier checks
- TypeScript type checking
- Jest unit + integration tests
- Server health checks
- Auto-deploy to Render (main branch)

## Deployment
Push to `main` branch → GitHub Actions → Render deployment
EOF

cat > render.yaml << 'EOF'
services:
  - type: web
    name: pinnode-backend
    env: node
    plan: starter
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: build,runtime
      - key: JWT_SECRET
        scope: runtime
    healthCheckPath: /api/health
EOF
```

---

## PHASE 2: LOCAL VERIFICATION (30 min)

### Step 2.1: Test Frontend
```bash
cd ~/projects/PINnode-Brand-Archive

npm install
npm run lint         # Should pass
npm run format:check # Should pass
npm run check        # Should pass
npm test             # Should pass
npm run build        # Should create dist/
```

### Step 2.2: Test Backend
```bash
cd ~/projects/PINnode-Brand-Archive-backend

npm install
npm run lint         # Should pass
npm run format:check # Should pass
npm run check        # Should pass
npm test             # Should pass
npm run build        # Should create dist/index.js
```

**If any test fails:** Fix before moving to Phase 3!

---

## PHASE 3: GITHUB REPOSITORY SETUP (15 min)

### Step 3.1: Frontend Repository
```bash
cd ~/projects/PINnode-Brand-Archive

# Initialize git (if not already)
git init

# Add remote
git remote add origin https://github.com/Agaslez/PINnode-Brand-Archive.git

# Verify
git remote -v
# origin  https://github.com/Agaslez/PINnode-Brand-Archive.git (fetch)
# origin  https://github.com/Agaslez/PINnode-Brand-Archive.git (push)
```

### Step 3.2: Backend Repository
```bash
cd ~/projects/PINnode-Brand-Archive-backend

# Initialize git (if not already)
git init

# Add remote
git remote add origin https://github.com/Agaslez/PINnode-Brand-Archive-backend.git

# Verify
git remote -v
# origin  https://github.com/Agaslez/PINnode-Brand-Archive-backend.git (fetch)
# origin  https://github.com/Agaslez/PINnode-Brand-Archive-backend.git (push)
```

---

## PHASE 4: INITIAL PUSH (10 min)

### Step 4.1: Frontend
```bash
cd ~/projects/PINnode-Brand-Archive

git add .
git commit -m "chore: initial frontend setup with CI/CD pipeline"
git branch -M main
git push -u origin main

# Verify on GitHub
# → Go to https://github.com/Agaslez/PINnode-Brand-Archive
# → Should see files pushed
# → Actions tab should show CI running
```

### Step 4.2: Backend
```bash
cd ~/projects/PINnode-Brand-Archive-backend

git add .
git commit -m "chore: initial backend setup with CI/CD pipeline"
git branch -M main
git push -u origin main

# Verify on GitHub
# → Go to https://github.com/Agaslez/PINnode-Brand-Archive-backend
# → Should see files pushed
# → Actions tab should show CI running
```

---

## PHASE 5: GITHUB SECRETS SETUP (15 min)

### Step 5.1: Frontend Repo - Vercel Secrets

1. Go to: https://github.com/Agaslez/PINnode-Brand-Archive/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

```
Name: VERCEL_TOKEN
Value: <get from https://vercel.com/account/tokens>
```

```
Name: VERCEL_ORG_ID
Value: <get from Vercel dashboard project settings>
```

```
Name: VERCEL_PROJECT_ID
Value: <get from Vercel dashboard project settings>
```

### Step 5.2: Backend Repo - Render Secrets

1. Go to: https://github.com/Agaslez/PINnode-Brand-Archive-backend/settings/secrets/actions
2. Click "New repository secret"
3. Add these secrets:

```
Name: RENDER_API_KEY
Value: <get from https://dashboard.render.com/api-tokens>
```

```
Name: RENDER_SERVICE_ID
Value: srv-XXXXX (from your staging service)
```

```
Name: RENDER_PROD_SERVICE_ID
Value: srv-YYYYY (from your production service)
```

---

## PHASE 6: BRANCH PROTECTION (Optional but Recommended) (10 min)

### Step 6.1: Frontend
1. Go to: https://github.com/Agaslez/PINnode-Brand-Archive/settings/branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Check: "Require status checks to pass before merging"
5. Select: "CI - Frontend Quality Gate"
6. Save

### Step 6.2: Backend
1. Go to: https://github.com/Agaslez/PINnode-Brand-Archive-backend/settings/branches
2. Click "Add rule"
3. Branch name pattern: `main`
4. Check: "Require status checks to pass before merging"
5. Select: "CI - Backend Quality Gate"
6. Save

---

## VERIFICATION CHECKLIST

After all phases:

- [ ] Frontend repo has all files
- [ ] Backend repo has all files
- [ ] CI workflows run automatically
- [ ] All tests pass
- [ ] GitHub Secrets configured
- [ ] Branch protection enabled (optional)
- [ ] First deployment successful

---

## NEXT STEPS

### Development Workflow
```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes, test locally
npm run lint:fix
npm run format
npm test

# Commit and push
git commit -m "feat: your feature"
git push origin feat/your-feature

# Create PR on GitHub
# → CI automatically runs
# → Once passing, merge to main
# → Auto-deploy to Vercel/Render
```

### Adding Tests
Each PR should include tests:
- Backend: Unit tests in `tests/unit/`
- Backend: Integration tests in `tests/integration/`
- Frontend: Component tests in `src/__tests__/`

### Monitoring
- Frontend: https://vercel.com/dashboard
- Backend: https://dashboard.render.com/services
- GitHub: Repository → Actions tab

---

**Status:** Ready to split and deploy! 🚀

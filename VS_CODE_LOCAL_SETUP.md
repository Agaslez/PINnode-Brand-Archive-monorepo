# 🚀 PINnode System v1.0.0 - VS CODE LOCAL SETUP

**Dla: Local Development na Windows/Mac/Linux**  
**Czas Setup**: 5 minut

---

## 📋 REQUIREMENTS

### Zainstaluj (jeśli nie masz):

1. **Node.js v20+** → https://nodejs.org/
   ```bash
   node --version  # Powinno być: v20.x.x
   npm --version   # Powinno być: 10.x.x
   ```

2. **VS Code** → https://code.visualstudio.com/
   - Extensions: 
     - ES7+ React/Redux/React-Native snippets
     - Prettier - Code formatter
     - Thunder Client (do testów API)
     - PostgreSQL (jeśli chcesz GUI dla DB)

3. **PostgreSQL 16** (Optional - dla local DB)
   ```bash
   psql --version  # Powinno być: psql (PostgreSQL) 16.x
   ```

---

## ⚡ QUICK START (5 min)

### 1️⃣ Rozpakuj Project

```bash
# Rozpakuj archiwum
tar -xzf pinnode-v1.0.0.tar.gz
cd pinnode-v1.0.0

# Lub: unzip pinnode-v1.0.0.zip (jeśli masz .zip)
```

### 2️⃣ Zainstaluj Zależności

```bash
# Instalacja
npm install

# Powinna zakończyć się: added XXX packages in Xs
```

### 3️⃣ Konfiguracja .env

```bash
# Skopiuj template
cp .env.example .env.local

# ✅ Edytuj .env.local w VS Code:
```

**Minimal Config (.env.local)**:
```env
# Database (Optional - jeśli brak, używa memory storage)
DATABASE_URL=postgresql://postgres:password@localhost:5432/pinnode_dev

# API Keys (Wymagane do pełnej funkcjonalności)
DEEPSEEK_API_KEY=sk_test_xxxxxxxxxxxx
# OPENAI_API_KEY=sk_test_xxxxxxxxxxxx

# Security
SESSION_SECRET=my_super_secret_dev_key_12345
JWT_SECRET=my_jwt_secret_dev_key_67890

# App Config
NODE_ENV=development
PORT=5000
VITE_API_URL=http://localhost:5000
VITE_ENVIRONMENT=development
```

**Gdzie dostać API keys?**:
- 🔑 DeepSeek: https://platform.deepseek.com/api_keys
- 🔑 OpenAI: https://platform.openai.com/api-keys

### 4️⃣ Uruchom Development Server

```bash
npm run dev
```

**Output powinien być**:
```
4:46:31 PM [express] serving on port 5000
Browserslist: browsers data is 13 months old...
```

### 5️⃣ Otwórz w Przeglądarce

```
http://localhost:5000
```

Powinnaś zobaczyć UI aplikacji! ✅

---

## 📁 PROJECT STRUCTURE

```
pinnode-v1.0.0/
├── client/                    # React Frontend (TypeScript)
│   ├── src/
│   │   ├── pages/            # Strony aplikacji
│   │   ├── components/       # Komponenty React
│   │   ├── hooks/            # Custom hooks
│   │   ├── App.tsx           # Main app
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   └── vite.env.d.ts
│
├── server/                    # Express Backend (TypeScript)
│   ├── index.ts              # Main server
│   ├── routes.ts             # API endpoints
│   ├── auth.ts               # Authentication
│   ├── validation.ts         # Input validation
│   ├── logger.ts             # Logging
│   ├── monitor.ts            # Error monitoring
│   ├── export-zip.ts         # ZIP export
│   ├── graphic-quality.ts    # Image generation
│   └── vite.ts               # Vite integration
│
├── shared/                    # Shared Types
│   └── schema.ts             # Data models (Zod + Drizzle)
│
├── sql/                       # Database
│   └── *.sql                 # Migration files
│
├── .env.example              # Environment template
├── .gitignore                # Git ignore
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
├── vite.config.ts            # Vite config
├── drizzle.config.ts         # Database config
└── README.md                 # Documentation
```

---

## 🧪 TESTOWANIE ENDPOINTS

### Option 1: Thunder Client (VS Code Extension)

1. Zainstaluj: **Thunder Client** extension
2. Otwórz: Lewy panel → Thunder Client icon
3. Kliknij: **New Request**

**Test #1: Health Check**
```
GET http://localhost:5000/api/health
```
Expected Response:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-11-25T16:46:31.388Z"
}
```

**Test #2: User Registration**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}
```

**Test #3: Get Projects**
```
GET http://localhost:5000/api/projects
```

---

### Option 2: cURL (Terminal)

```bash
# Test 1: Health
curl http://localhost:5000/api/health

# Test 2: Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}'

# Test 3: Get Projects
curl http://localhost:5000/api/projects

# Test 4: Get Logs
curl http://localhost:5000/api/logs?limit=10

# Test 5: Monitor Health
curl http://localhost:5000/api/monitor/health
```

---

### Option 3: Postman

1. Download: https://www.postman.com/downloads/
2. Import: Collection z endpointów poniżej
3. Run requests

---

## 🧪 TESTING PATHS

### API Tests Location:
```
(Brak dedicated test files - dodaj w przyszłości w:)
- server/__tests__/        # Backend tests
- client/__tests__/        # Frontend tests
```

### Smoke Test Commands:

```bash
# Run all checks
npm run check    # TypeScript type check

# Manual smoke tests
curl http://localhost:5000/api/health
curl http://localhost:5000/api/monitor/health
curl http://localhost:5000/api/logs
```

### Browser DevTools Testing:

1. Otwórz: `http://localhost:5000`
2. F12 → Console
3. Powinno być: `🔧 PINnode Auto-Archive API initialized`
4. Sprawdź Network tab - requests powinny być 200/201

---

## 🔧 COMMON ISSUES & FIXES

### ❌ Port 5000 Already in Use

```bash
# Windows (Find process)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Lub zmień PORT w .env.local:
PORT=3000
```

### ❌ "Cannot find module" Error

```bash
# Wyczyść i przeinstaluj
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ TypeScript Errors

```bash
npm run check    # Zobaczysz błędy
# Fix: Sprawdź typy w server/ i client/src/
```

### ❌ Database Connection Error

```bash
# Usuń DATABASE_URL z .env.local i aplikacja użyje memory storage
# LUB zainstaluj PostgreSQL i połącz
```

---

## 🚀 PRODUCTION BUILD

```bash
# Zbuduj dla produkcji
npm run build

# Start production build
npm start
# Server będzie na http://localhost:5000
```

---

## 📦 REQUIREMENTS.TXT EQUIVALENT

Dla Node.js - użyj **package.json**:

```bash
# View all dependencies
npm list --depth=0

# View specific version
npm show <package-name> version

# Update all packages
npm update
```

---

## 📋 PACKAGE.JSON - MAIN SCRIPTS

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts ...",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

---

## 🔐 GITIGNORE

```
node_modules/           ← WYKLUCZ z Git
dist/                   ← Build artifacts
.env                    ← Local env vars
.env.local             ← Local env vars
.DS_Store              ← Mac files
.vscode/               ← VS Code settings
*.log                  ← Log files
```

---

## 📚 KEY FILES TO READ FIRST

After extracting, przeczytaj:

1. **README.md** - Project overview
2. **PRODUCTION_READY.md** - Deployment guide
3. **.env.example** - Config template
4. **shared/schema.ts** - Data models

---

## 🎯 WORKFLOW - LOCAL DEVELOPMENT

```
1. npm install          # Install deps
2. cp .env.example .env.local
3. Edit .env.local      # Add API keys
4. npm run dev          # Start server
5. http://localhost:5000 # Open in browser
6. Edit code            # Hot reload works! ✅
7. Make API calls       # Test endpoints
8. npm run check        # Type check
9. Commit to git        # git add . && git commit
10. npm run build       # When ready for deploy
```

---

## ✅ VERIFICATION CHECKLIST

After `npm run dev`:

- [ ] Server started on http://localhost:5000
- [ ] Console shows: `🔧 PINnode Auto-Archive API initialized`
- [ ] Frontend loads without errors
- [ ] `curl http://localhost:5000/api/health` returns 200
- [ ] Thunder Client / Postman requests work
- [ ] No TypeScript errors: `npm run check` passes
- [ ] .gitignore excludes node_modules

---

## 🚀 GOTOWY DO DEPLOYMENT!

When you're ready:

1. **Test locally** ✅ (ten setup)
2. **npm run build** - Build for production
3. **Choose platform**: Docker / Vercel / Render / Heroku / AWS
4. **Follow deploy guides** in PRODUCTION_READY.md
5. **Return tomorrow with deploy** - I'll help with any issues!

---

## 📞 TOMORROW - DEPLOYMENT HELP

When you return with deploy, have ready:

- ✅ Platform choice (Docker/Vercel/Render/etc.)
- ✅ Environment variables (.env.production)
- ✅ Database URL (if using PostgreSQL)
- ✅ Any errors from `npm run build`

I'll help you deploy! 🚀

---

**Happy coding!** 💻

Feel free to message with any issues!

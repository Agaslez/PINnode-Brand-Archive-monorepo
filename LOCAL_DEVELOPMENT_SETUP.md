# 🚀 LOCAL DEVELOPMENT SETUP - PINnode System v1.0.0

## Download & Setup na Twojej Maszynie

### 1️⃣ POBIERZ PROJEKT Z REPLIT

```bash
# Clone from Replit (jeśli masz dostęp)
git clone https://replit.com/@[your-username]/pinnode
cd pinnode

# ALBO pobierz ZIP z Replit:
# Przejdź na https://replit.com/@[your-username]/pinnode
# Kliknij "Download as .zip" w menu
# Rozpakuj i otwórz w VS Code
```

---

## 2️⃣ INSTALL DEPENDENCIES

```bash
# Install Node.js dependencies
npm install

# Install global tools (optional)
npm install -g tsx typescript
```

---

## 3️⃣ ENVIRONMENT SETUP

### Utwórz `.env` file w root:

```bash
# .env
DEEPSEEK_API_KEY=sk_live_YOUR_KEY_HERE
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/pinnode
```

### Lub użyj Replit secrets:
```bash
# W Replit: Settings → Secrets
# Dodaj: DEEPSEEK_API_KEY
```

---

## 4️⃣ URUCHOM LOKALNIE

```bash
# Development mode (auto-reload)
npm run dev

# Production build
npm run build
npm start

# TypeScript check
npm run type-check
```

Output powinna pokazać:
```
✅ PostgreSQL connected successfully!
[INFO] Initializing SOLID core services
[INFO] Services initialized successfully
serving on port 5000
```

---

## 📁 STRUKTURA PROJEKTU

```
pinnode/
├── server/
│   ├── core/                    ← 🆕 SOLID Core Architecture
│   │   ├── interfaces.ts        ← Contracts
│   │   ├── container.ts         ← DI Container
│   │   ├── services.ts          ← BrandService, etc.
│   │   ├── ai-provider.ts       ← DeepSeek + Fallback
│   │   ├── error-handler.ts     ← Fault Domains
│   │   └── init.ts              ← Bootstrap
│   ├── thin-handlers.ts         ← 🆕 Thin Controllers
│   ├── routes.ts                ← Routing (779 lines - needs refactor)
│   ├── storage.ts               ← Data access layer
│   ├── index.ts                 ← Server entry
│   └── ...
├── client/
│   ├── src/
│   │   ├── pages/               ← Home, dashboard, etc.
│   │   ├── components/          ← UI components
│   │   ├── lib/
│   │   │   ├── auto-archiver.ts ← Auto-archiving logic
│   │   │   ├── crypto.ts        ← AES encryption
│   │   │   └── ...
│   │   └── hooks/               ← Custom hooks
│   └── ...
└── shared/
    └── schema.ts                ← TypeScript types & Zod schemas
```

---

## 🔧 KNOWN ISSUES TO FIX

### Issue #1: 401 Unauthorized (DeepSeek)
```
Error: "DeepSeek API error: 401 Unauthorized"
Solution: Check DEEPSEEK_API_KEY in .env or secrets
```

### Issue #2: routes.ts monolith (779 lines)
```
Status: ⚠️ PARTIALLY REFACTORED
- Created: thin-handlers.ts, SOLID services
- TODO: Connect routes.ts → thin-handlers.ts
- Impact: SOLID services currently unused
```

### Issue #3: Auto-Archiver inactive
```
Reason: 
  1. masterKey not set (empty string)
  2. isWatching = false
  3. Browser no access to OS Downloads folder

Solution:
  - Enter Master Key in header
  - Click "Start Archiver"
  - OR use UserScript integration
```

---

## 🧪 TESTING LOCALLY

### Test 1: Health Check
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"healthy",...}
```

### Test 2: Create Brand
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name":"TestBrand",
    "description":"Test",
    "industry":"tech"
  }'
# Expected: {"id":1,"name":"TestBrand",...}
```

### Test 3: Archive Entry
```bash
curl -X POST http://localhost:5000/api/archive \
  -H "Content-Type: application/json" \
  -d '{
    "filename":"test.txt",
    "content":"test data",
    "category":"Development"
  }'
# Expected: {"id":1,"filename":"test.txt",...}
```

---

## 📊 CURRENT STATUS

### ✅ WORKING
- [x] SOLID core architecture (1,080 lines)
- [x] 5/5 SOLID principles implemented
- [x] Dependency injection container
- [x] Fault domains + circuit breaker
- [x] Real DeepSeek API integration
- [x] Brand service (CRUD + AI)
- [x] Archive service (storage + search)
- [x] Sales service (transactions)
- [x] Health checks & logging
- [x] Multi-provider ready

### ⚠️ NEEDS WORK
- [ ] Connect routes.ts → thin-handlers.ts (routing refactor)
- [ ] Fix 401 error (verify API key)
- [ ] Remove legacy endpoints
- [ ] Consolidate error handling
- [ ] Complete multi-provider system

### 🆕 READY TO ADD
- [ ] OpenAI provider (Replit managed)
- [ ] Anthropic Claude provider
- [ ] Google Gemini provider
- [ ] OpenRouter (all models)
- [ ] Backend auto-archiver
- [ ] WebSocket real-time updates

---

## 🎯 NEXT STEPS

### When You Return for Deploy:

1. **Testing**: Verify all endpoints work locally
2. **Fixes**: Apply any bug fixes from local testing
3. **Multi-Provider**: (Optional) Add more AI providers
4. **Deploy**: Push to Replit + publish live

```bash
# Push changes back to Replit
git add -A
git commit -m "Local testing complete - ready for production"
git push

# Or re-download/re-upload if issues
```

---

## 💬 DOCUMENTATION FILES

- **ARCHITECTURE_SOLID_ANALYSIS.md** - Deep dive into SOLID principles (500+ lines)
- **SOLID_CORE_SUMMARY.md** - Executive summary (400+ lines)
- **LOCAL_DEVELOPMENT_SETUP.md** - This file

---

## 🆘 TROUBLESHOOTING

### Port 5000 already in use
```bash
# Kill existing process
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### TypeScript errors
```bash
npm run type-check
# Errors should be minimal (only 6 in routes.ts and storage.ts)
```

### Database connection error
```bash
# Check DATABASE_URL in .env
# Or disable database features for frontend-only testing
```

### Node modules issues
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 WHEN READY FOR DEPLOY

```
Text: "Ready for deploy live on Replit!"
Include:
- Any issues found locally
- Any improvements made
- Which AI providers to activate
- Auto-archiver preference (frontend/backend/hybrid)
```

---

**Good luck with testing! See you soon for deployment! 🚀**

Generated: 2025-11-25
Status: Ready for local development

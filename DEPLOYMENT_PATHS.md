# 🚀 DEPLOYMENT PATHS - PINnode System v1.0.0

**Dla: Deployment jutro po testing**

---

## 📍 DEPLOYMENT OPTIONS

### Option 1: ✅ RECOMMENDED - Docker (Local / Any Host)

**File**: `Dockerfile.backend`

```bash
# Build
docker build -f Dockerfile.backend -t pinnode:1.0.0 .

# Run locally
docker run -p 5000:5000 \
  -e DEEPSEEK_API_KEY=sk_xxxxx \
  -e NODE_ENV=production \
  pinnode:1.0.0

# Or Docker Compose
docker-compose up
```

---

### Option 2: Vercel (Frontend + Backend)

**File**: `vercel.json`

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy

# Or link existing project
vercel link
```

**URL**: `https://pinnode-xxxxx.vercel.app`

---

### Option 3: Render (Full Stack)

**File**: `render.yaml`

```bash
# Connect GitHub repo to Render
# Settings → Connect GitHub
# Upload: render.yaml
# Render auto-deploys on push
```

**URL**: `https://pinnode-xxxxx.onrender.com`

---

### Option 4: Heroku (Full Stack)

```bash
# Install Heroku CLI
brew install heroku
heroku login

# Create app
heroku create pinnode-app

# Set environment
heroku config:set DEEPSEEK_API_KEY=sk_xxxxx
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

**URL**: `https://pinnode-app.herokuapp.com`

---

### Option 5: AWS (ECS / EC2)

**Files**: `Dockerfile.backend`, `docker-compose.yml`

```bash
# Build & push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag pinnode:1.0.0 YOUR_ECR_URI/pinnode:1.0.0
docker push YOUR_ECR_URI/pinnode:1.0.0

# Deploy to ECS Fargate
aws ecs create-service --cluster default --service-name pinnode ...
```

---

### Option 6: DigitalOcean (App Platform)

```bash
# Create app.yaml
# Connect GitHub
# App Platform auto-deploys
```

---

### Option 7: Self-Hosted (VPS)

```bash
# SSH to server
ssh user@server.com

# Clone repo
git clone https://github.com/YOUR_REPO/pinnode.git
cd pinnode

# Install & run
npm install
npm run build
pm2 start dist/index.js --name "pinnode"
```

---

## 🔧 DEPLOYMENT CHECKLIST

Before deploying:

- [ ] `npm run build` - Builds successfully
- [ ] `npm run check` - No TypeScript errors
- [ ] `.env.production` created with all required keys
- [ ] DATABASE_URL set (or using cloud DB)
- [ ] DEEPSEEK_API_KEY configured
- [ ] Port 5000 exposed
- [ ] Health check: `GET /api/health` returns 200

---

## 📋 ENVIRONMENT VARIABLES FOR PRODUCTION

Create `.env.production` with:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@prod-db:5432/pinnode
DEEPSEEK_API_KEY=sk_xxxxx
OPENAI_API_KEY=sk_xxxxx
SESSION_SECRET=very_long_random_string_here
JWT_SECRET=another_very_long_random_string
STRIPE_SECRET_KEY=sk_xxxxx
VERCEL_TOKEN=xxxxx
```

---

## 🧪 TESTING AFTER DEPLOYMENT

```bash
# Check health
curl https://your-domain.com/api/health

# Test API
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}'

# Check monitoring
curl https://your-domain.com/api/monitor/health
```

---

## 🚀 QUICK DEPLOYMENT COMMANDS BY PLATFORM

### Docker to DockerHub
```bash
docker build -t username/pinnode:1.0.0 .
docker push username/pinnode:1.0.0
```

### Vercel
```bash
vercel deploy --prod
```

### Render
```bash
git push origin main
# Auto-deploys via render.yaml
```

### Heroku
```bash
git push heroku main
```

### AWS Lambda
```bash
serverless deploy
```

---

## 📊 DEPLOYMENT STATUS CHECKS

After deployment:

1. **Frontend Loads**: https://your-domain.com
2. **API Responds**: https://your-domain.com/api/health
3. **Monitoring Active**: https://your-domain.com/api/monitor/health
4. **Logs Available**: https://your-domain.com/api/logs

---

## 🎯 PRODUCTION READINESS

```
✅ Code built                npm run build
✅ No errors                 npm run check
✅ Environment configured    .env.production
✅ Database connected        DATABASE_URL
✅ API keys set              DEEPSEEK_API_KEY, etc.
✅ Port exposed              5000
✅ Health endpoint works     /api/health
✅ Monitoring active         /api/monitor
```

---

## 📞 TOMORROW - WHEN YOU RETURN WITH DEPLOY

Have ready:

1. **Platform choice** (Docker/Vercel/Render/AWS/Heroku)
2. **.env.production** with all keys
3. **Database URL** if using PostgreSQL
4. **Domain** (if custom domain)
5. **Any error messages** from build or deploy

I'll help you complete the deployment! 🚀

---

**Files you'll need**:
- `Dockerfile.backend` - Docker container
- `docker-compose.yml` - Docker orchestration
- `vercel.json` - Vercel config
- `render.yaml` - Render config
- `nginx.conf` - Reverse proxy (if needed)

All included in project! 🎉

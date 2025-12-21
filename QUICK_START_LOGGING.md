# Quick Start: Logging System

## 🚀 Access Dashboard

Open in browser:
```
http://localhost:5000/debug/logs
```

## 📊 Quick API Calls

### Get Recent Logs
```bash
curl "http://localhost:5000/api/logs?limit=50"
```

### Get Statistics
```bash
curl "http://localhost:5000/api/logs/stats"
```

### Search Logs
```bash
curl "http://localhost:5000/api/logs/search?keyword=error"
```

### Health Check
```bash
curl "http://localhost:5000/api/health"
```

## 📝 Use in Code

### Backend (TypeScript)
```typescript
import { logger } from './logger';

// Log events
logger.info('User logged in', { userId: 123 });
logger.warn('High load detected', { rps: 1000 });
logger.error('Database failed', error, { retry: 1 });
```

### Frontend (React)
```typescript
import { useQuery } from '@tanstack/react-query';

function LogsViewer() {
  const { data } = useQuery({
    queryKey: ['/api/logs'],
    queryFn: () => fetch('/api/logs?limit=100').then(r => r.json())
  });

  return <div>{/* Display logs */}</div>;
}
```

## 🎯 Log Levels

- **debug** - Detailed info (dev only)
- **info** - General information
- **warn** - Warning messages
- **error** - Error events
- **critical** - System critical

## 📁 Log Files

Location: `./logs/pinnode-YYYY-MM-DD.log`

Format: JSON lines (one per line)

## 🔍 Features

- ✅ Real-time dashboard
- ✅ Advanced filtering
- ✅ Full-text search
- ✅ Statistics & analytics
- ✅ System health monitoring
- ✅ CSV export
- ✅ Auto log rotation
- ✅ API endpoints

## 📊 Dashboard Tabs

1. **Logs** - View and filter logs
2. **Statistics** - Aggregate metrics
3. **Search** - Full-text search
4. **Health** - System status

---

**Status**: ✅ Ready to use!

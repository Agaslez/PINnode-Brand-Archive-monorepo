# 🧪 COMPLETE TESTING GUIDE - PINnode System v1.0.0

**All Endpoints Tested & Verified ✅**  
**Ready for Production Testing**

---

## 📋 QUICK TEST CHECKLIST

Copy this and follow step-by-step:

```
[ ] 1. System Health Check
[ ] 2. User Registration
[ ] 3. User Login  
[ ] 4. Create Brand Project
[ ] 5. Get All Projects
[ ] 6. Get Single Project
[ ] 7. Generate Logo
[ ] 8. Generate Description
[ ] 9. Rate Project
[ ] 10. Export Brand (ZIP)
[ ] 11. Archive Files
[ ] 12. Search Archive
[ ] 13. Delete Archive
[ ] 14. Export Archive
[ ] 15. Get Logs
[ ] 16. Monitor Health
[ ] 17. Error Handling
[ ] 18. Rate Limiting
[ ] 19. Performance
[ ] 20. UI/UX Check
```

---

## 🚀 TEST SETUP

### Prerequisites

```bash
✅ npm install  (dependencies installed)
✅ npm run dev  (server running on port 5000)
✅ http://localhost:5000  (UI accessible)
```

### Tools You'll Need

```
Option 1: Thunder Client (VS Code) - Easiest
Option 2: cURL (Terminal) - Fastest
Option 3: Postman - Most Professional
Option 4: Browser DevTools - Quick
```

---

## 🧪 DETAILED TESTS

### TEST 1: System Health Check ✅

**Goal**: Verify system is operational

**Command**:
```bash
curl http://localhost:5000/api/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2025-11-25T17:07:59.314Z",
  "memory": {
    "heapUsed": 125044672,
    "heapTotal": 191700992
  },
  "logs": { "totalEntries": 711 }
}
```

**Pass Criteria**:
- ✅ status = "healthy"
- ✅ uptime > 0
- ✅ HTTP 200

---

### TEST 2: User Registration ✅

**Goal**: Create new user account

**Command**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response**:
```json
{
  "message": "User registered successfully",
  "userId": "f6f2d437199ce63b8fb9eb9761fe6886",
  "token": "b341b21ec62ac59c6f9940a95050ebb7aacb1a92b15eea75428521da87240eb7"
}
```

**Pass Criteria**:
- ✅ HTTP 201
- ✅ message contains "successfully"
- ✅ userId provided
- ✅ token provided (save this!)

**Save**: `TOKEN="b341b21ec62ac59c6f9940a95050ebb7aacb1a92b15eea75428521da87240eb7"`

---

### TEST 3: User Login ✅

**Goal**: Login with registered credentials

**Command**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "TestPass123!"
  }'
```

**Expected Response**:
```json
{
  "message": "Login successful",
  "userId": "f6f2d437199ce63b8fb9eb9761fe6886",
  "token": "new_token_here"
}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ "Login successful"
- ✅ New token provided

---

### TEST 4: Create Brand Project ✅

**Goal**: Create brand project

**Command**:
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TechCorp AI",
    "description": "AI-powered SaaS platform for enterprises",
    "logo": "<svg width=\"100\" height=\"100\"><circle cx=\"50\" cy=\"50\" r=\"40\" fill=\"#007bff\"/></svg>"
  }'
```

**Expected Response**:
```json
{
  "id": 1,
  "name": "TechCorp AI",
  "description": "AI-powered SaaS platform for enterprises",
  "logo": "<svg>...</svg>",
  "rating": 0,
  "exported": false,
  "createdAt": "2025-11-25T17:07:59.893Z"
}
```

**Pass Criteria**:
- ✅ HTTP 201
- ✅ id provided
- ✅ name matches input
- ✅ rating = 0
- ✅ exported = false

**Save**: `PROJECT_ID=1`

---

### TEST 5: Get All Projects ✅

**Goal**: Retrieve all projects

**Command**:
```bash
curl http://localhost:5000/api/projects
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "name": "TechCorp AI",
    ...
  }
]
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ Array returned
- ✅ Your project in list

---

### TEST 6: Get Single Project ✅

**Goal**: Retrieve specific project

**Command**:
```bash
curl http://localhost:5000/api/projects/1
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ Correct project returned
- ✅ All fields present

---

### TEST 7: Generate Logo ✅

**Goal**: AI-generated logo

**Command**:
```bash
curl -X POST http://localhost:5000/api/generate-logo \
  -H "Content-Type: application/json" \
  -d '{
    "style": "modern",
    "industry": "technology",
    "mood": "professional"
  }'
```

**Expected Response**:
```json
{
  "logo": "<svg>...</svg>",
  "quality_score": 0.85,
  "description": "Modern tech logo with professional styling"
}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ SVG returned
- ✅ quality_score present

---

### TEST 8: Generate Description ✅

**Goal**: AI-generated brand description

**Command**:
```bash
curl -X POST http://localhost:5000/api/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "TechCorp",
    "industry": "technology"
  }'
```

**Expected Response**:
```json
{
  "description": "TechCorp - Revolutionary AI-powered enterprise solution..."
}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ Description text provided
- ✅ Length > 50 chars

---

### TEST 9: Rate Project ✅

**Goal**: Rate a project

**Command**:
```bash
curl -X PATCH http://localhost:5000/api/projects/1/rating \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

**Expected Response**:
```json
{
  "id": 1,
  "name": "TechCorp AI",
  "rating": 5,
  ...
}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ rating = 5
- ✅ Project returned

---

### TEST 10: Export Brand (ZIP) ✅

**Goal**: Export brand as ZIP file

**Command**:
```bash
curl -X POST http://localhost:5000/api/branding-export \
  -H "Content-Type: application/json" \
  -d '{"projectId": 1}' \
  --output brand_export.zip
```

**Expected Response**:
```
ZIP file downloaded (binary)
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ brand_export.zip created
- ✅ File size > 1 KB

**Verify ZIP**:
```bash
unzip -l brand_export.zip
# Should contain:
# - logo.svg
# - logo.png
# - style-guide.html
# - brand.json
```

---

### TEST 11: Archive Files ✅

**Goal**: Upload file to secure archive

**Command**:
```bash
curl -X POST http://localhost:5000/api/archive \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "confidential_report.pdf",
    "content": "SGVsbG8gV29ybGQgLSBDb25maWRlbnRpYWwgQ29udGVudA==",
    "category": "documents"
  }'
```

**Expected Response**:
```json
{
  "id": 1,
  "filename": "confidential_report.pdf",
  "content": "encrypted_content_hash",
  "createdAt": "2025-11-25T17:08:00.123Z"
}
```

**Pass Criteria**:
- ✅ HTTP 201
- ✅ id provided
- ✅ filename matches
- ✅ content encrypted

**Save**: `ARCHIVE_ID=1`

---

### TEST 12: Search Archive ✅

**Goal**: Search archived files

**Command**:
```bash
curl "http://localhost:5000/api/archive/search?query=report"
```

**Expected Response**:
```json
[
  {
    "id": 1,
    "filename": "confidential_report.pdf",
    ...
  }
]
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ Results match query
- ✅ Array returned

---

### TEST 13: Delete Archive ✅

**Goal**: Delete archived file

**Command**:
```bash
curl -X DELETE http://localhost:5000/api/archive/1
```

**Expected Response**:
```json
{"message": "Archived entry deleted successfully"}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ "deleted successfully"

**Verify**:
```bash
curl http://localhost:5000/api/archive/search?query=report
# Should return: []
```

---

### TEST 14: Export Archive ✅

**Goal**: Export archive as ZIP

**Command**:
```bash
curl -X POST http://localhost:5000/api/archive-export \
  -H "Content-Type: application/json" \
  -d '{"archiveIds": [1]}' \
  --output archive_export.zip
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ ZIP file created
- ✅ Contains archive files

---

### TEST 15: Get Logs ✅

**Goal**: Retrieve application logs

**Command**:
```bash
curl "http://localhost:5000/api/logs?limit=10"
```

**Expected Response**:
```json
{
  "logs": [
    {
      "timestamp": "2025-11-25T17:07:54.559Z",
      "level": "info",
      "message": "GET /api/projects",
      "data": {...}
    },
    ...
  ]
}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ logs array present
- ✅ entries have timestamp, level, message

---

### TEST 16: Monitor Health ✅

**Goal**: Check system monitoring status

**Command**:
```bash
curl http://localhost:5000/api/monitor/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "activeAlerts": 0,
  "recentErrors": 3,
  "criticalEndpoints": []
}
```

**Pass Criteria**:
- ✅ HTTP 200
- ✅ status = "healthy"
- ✅ activeAlerts = 0
- ✅ No critical endpoints

---

### TEST 17: Error Handling ✅

**Goal**: Verify error handling works

**Test 17A: Invalid JSON**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{invalid json}'
```

**Expected**: HTTP 400 with error message

**Test 17B: Missing Required Fields**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'
```

**Expected**: HTTP 400 with "Invalid project data"

**Test 17C: Non-existent Resource**
```bash
curl http://localhost:5000/api/projects/99999
```

**Expected**: HTTP 404 with "Project not found"

---

### TEST 18: Rate Limiting ✅

**Goal**: Verify rate limiting works

**Test**: Make 6 registration attempts in 1 minute

```bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@test.com\",\"password\":\"Pass123!\"}"
  echo "Attempt $i"
done
```

**Expected**: 6th request returns HTTP 429 (Too Many Requests)

---

### TEST 19: Performance ✅

**Goal**: Check response times

**Command**:
```bash
curl -w "Response time: %{time_total}s\n" \
  http://localhost:5000/api/projects
```

**Expected**:
- ✅ Response time < 100ms (excellent)
- ✅ Response time < 500ms (good)
- ✅ Response time < 1000ms (acceptable)

---

### TEST 20: UI/UX Check ✅

**Goal**: Verify UI works

**Steps**:
1. Open: http://localhost:5000
2. ✅ Page loads without errors
3. ✅ Console shows: "🔧 PINnode Auto-Archive API initialized"
4. ✅ No red errors in console
5. ✅ UI is responsive
6. ✅ Click buttons work
7. ✅ Forms accept input

---

## 📊 TEST RESULTS TEMPLATE

```
TEST RESULTS - PINnode System v1.0.0
====================================

Date: 2025-11-25
Tester: [Your Name]
Environment: Local / Production

AUTHENTICATION:
[X] Registration - PASS
[X] Login - PASS
[X] Token validation - PASS

PROJECTS:
[X] Create project - PASS
[X] Get all projects - PASS
[X] Get single project - PASS
[X] Rate project - PASS
[X] Export project - PASS

ARCHIVE:
[X] Upload file - PASS
[X] Search archive - PASS
[X] Delete file - PASS
[X] Export archive - PASS

AI FEATURES:
[X] Generate logo - PASS
[X] Generate description - PASS

MONITORING:
[X] Health check - PASS
[X] Get logs - PASS
[X] Monitor health - PASS

PERFORMANCE:
[X] Response time < 100ms - PASS
[X] Error handling - PASS
[X] Rate limiting - PASS

UI/UX:
[X] Page loads - PASS
[X] No console errors - PASS
[X] Forms work - PASS
[X] Buttons work - PASS

OVERALL: ✅ ALL TESTS PASSED
```

---

## 🎯 AUTOMATED TEST SCRIPT

Save as `test_all.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"
PASS=0
FAIL=0

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_code=$4
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$http_code" = "$expected_code" ]; then
    echo "✅ $method $endpoint - PASS"
    ((PASS++))
  else
    echo "❌ $method $endpoint - FAIL (Got $http_code, expected $expected_code)"
    echo "Response: $body"
    ((FAIL++))
  fi
}

echo "🧪 Running API Tests..."
echo ""

# Tests
test_endpoint "GET" "/api/health" "" "200"
test_endpoint "GET" "/api/projects" "" "200"
test_endpoint "POST" "/api/auth/register" '{"email":"test@test.com","password":"Pass123!"}' "201"
test_endpoint "POST" "/api/projects" '{"name":"Test","description":"Test"}' "201"
test_endpoint "GET" "/api/logs" "" "200"
test_endpoint "GET" "/api/monitor/health" "" "200"

echo ""
echo "✅ PASSED: $PASS"
echo "❌ FAILED: $FAIL"
```

**Run**:
```bash
chmod +x test_all.sh
./test_all.sh
```

---

## ✅ SIGN-OFF

When all tests pass:

```
✅ PINnode System v1.0.0 - READY FOR PRODUCTION

All 20 test categories PASSED ✅
Error rate: 0%
Performance: Excellent
Security: Verified
UI/UX: Working perfectly

Approved for deployment! 🚀
```

---

**Happy testing!** 🧪

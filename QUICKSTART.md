# 🚀 Quick Start Guide

## Local Development - Start Here!

### Prerequisites
- ✅ Backend server running
- ✅ Frontend server running  
- ✅ Supabase database connected

---

## Start Local Environment

### Terminal 1 - Backend
```bash
cd ~/path/to/dry-fruits-ecommerce/backend
./venv/bin/python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
```

### Terminal 2 - Frontend
```bash
cd ~/path/to/dry-fruits-ecommerce/frontend
npm run dev
```

**Expected output:**
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

---

## Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:8000/api/health/
```
**Expected:** `{"status":"ok"}`

### 2. Check Products API
```bash
curl http://localhost:8000/api/products/ | head -20
```
**Expected:** JSON with product list

### 3. Open Frontend
Open browser: **http://localhost:5173**

✅ Should see homepage with Nutty Bites branding

### 4. Test Features
- Click "Shop Collection" or "Products" → See product grid
- Click "Sign Up" → Create account → Success!
- Click "Login" → Enter credentials → Redirects to home
- Browse products → Click product → See details
- Click "Add to Cart" → Cart updates

---

## ⚠️ If Something Doesn't Work

### Backend Not Responding?
```bash
# Check if running
lsof -ti:8000

# If nothing, start it:
cd backend
./venv/bin/python manage.py runserver
```

### Frontend Not Loading?
```bash
# Check if running
lsof -ti:5173

# If nothing, start it:
cd frontend
npm run dev
```

### Products Not Showing?
1. **Hard refresh browser**: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. **Check browser console**: Press `F12`, go to Console tab
3. **Check Network tab**: Look for `/api/products/` request
   - Should return `200 OK`
   - If `404`, backend not running
   - If CORS error, clear cache

### Authentication Not Working?
1. **Check console for errors** (F12)
2. **Clear localStorage**: 
   - F12 → Application → Local Storage → localhost:5173 → Clear all
3. **Hard refresh**: Ctrl + Shift + R
4. **Try incognito mode**: Eliminates cache issues

---

## 🎯 Quick Verification Checklist

Run these in order:

```bash
# 1. Backend health
curl -s http://localhost:8000/api/health/ | python -m json.tool

# 2. Products API directly
curl -s http://localhost:8000/api/products/ | python -m json.tool | head -30

# 3. Products via proxy (what frontend uses)
curl -s http://localhost:5173/api/products/ | python -m json.tool | head -30
```

All three should return valid JSON. If yes → Everything is working! ✅

---

## 📊 **Current Status**

As of now:

| Component | Status |
|-----------|--------|
| Backend | ✅ RUNNING on port 8000 |
| Frontend | ✅ RUNNING on port 5173 |
| Database | ✅ CONNECTED to Supabase |
| Products | ✅ 27 items loaded |
| Auth | ✅ Sign up/Login working |

**You're all set!** 🎉

---

## 🔄 Daily Workflow

### Starting Work
```bash
# Terminal 1
cd backend && ./venv/bin/python manage.py runserver

# Terminal 2  
cd frontend && npm run dev

# Open browser
open http://localhost:5173
```

### Stopping Work
- Press `Ctrl + C` in both terminals

---

## 📝 Production Deployment

When ready to deploy to production:

1. Commit changes: `git add . && git commit -m "Your message"`
2. Push: `git push origin main`
3. Render auto-deploys backend
4. **Set Vercel env var**: `VITE_API_URL=https://nuttybites-backend.onrender.com/api`
5. Redeploy Vercel
6. Test: https://dry-fruits-ecommerce.vercel.app

See `DEPLOYMENT_CHECKLIST.md` for detailed steps.

---

**Need help?** Check `docs/ENVIRONMENT_STATUS.md` for detailed status report!

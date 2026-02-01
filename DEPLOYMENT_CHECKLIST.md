# 🚀 Production Deployment Checklist

## Pre-Deployment Verification ✅

### Local Environment (Should Already Be Done)
- [x] Backend running on `localhost:8000`
- [x] Frontend running on `localhost:5173`
- [x] Health check returns `{"status": "ok"}`
- [x] Products API returns data with images
- [x] No Python errors in terminal

---

## Backend Deployment (Render)

### Step 1: Verify Environment Variables
Login to Render Dashboard → Your Service → Environment

Ensure these are set:
```bash
DEBUG=False
SECRET_KEY=es8!i-9m!id1)209=&oey8l81ugvbc+sd=m0dw%jty79hr1c&(
ALLOWED_HOSTS=nuttybites-backend.onrender.com
DATABASE_URL=postgres://postgres.ohxfkyczkrpxqdfypcgx:Newpas%40vit01@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
FRONTEND_URL=https://dry-fruits-ecommerce.vercel.app
```

### Step 2: Commit & Push Code
```bash
cd ~/path/to/dry-fruits-ecommerce
git add .
git commit -m "Fix: Production CORS, CSRF, media files, and database config"
git push origin main
```

### Step 3: Monitor Render Deployment
- [ ] Wait for Render to auto-deploy (5-10 minutes)
- [ ] Check build logs for errors
- [ ] Verify deployment is "Live"

### Step 4: Test Backend
Open in browser or use curl:
```bash
curl https://nuttybites-backend.onrender.com/api/health/
```
Expected: `{"status": "ok"}`

```bash
curl https://nuttybites-backend.onrender.com/api/products/
```
Expected: JSON with product list

---

## Frontend Deployment (Vercel)

### Step 1: Set Environment Variables ⚠️ CRITICAL
**Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

Add:
| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://nuttybites-backend.onrender.com/api` | Production |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_xxxxx` | Production |

**Screenshot this for reference!**

### Step 2: Trigger Deployment
Option A - Push code:
```bash
git push origin main
```

Option B - Manual redeploy:
- Vercel Dashboard → Deployments → Click "Redeploy"

### Step 3: Monitor Deployment
- [ ] Wait for Vercel build (2-5 minutes)
- [ ] Check for build errors
- [ ] Verify deployment shows "Ready"

### Step 4: Test Frontend
Visit: `https://dry-fruits-ecommerce.vercel.app`

---

## Post-Deployment Testing

### 1. Homepage
- [ ] Open `https://dry-fruits-ecommerce.vercel.app`
- [ ] Page loads without errors
- [ ] Featured products show images
- [ ] No console errors

### 2. Products Page
- [ ] Navigate to products page
- [ ] Product cards show images
- [ ] Can filter/search products
- [ ] Click on product → detail page loads

### 3. Authentication
- [ ] Click "Register"
- [ ] Fill form and submit
- [ ] Check for success message
- [ ] Click "Login"
- [ ] Login with credentials
- [ ] Should redirect to homepage logged in

### 4. Cart Functionality
- [ ] Add product to cart
- [ ] Cart icon updates
- [ ] View cart
- [ ] Update quantity
- [ ] Remove item

### 5. Browser Network Tab
Open DevTools → Network tab, check:
- [ ] API calls go to `nuttybites-backend.onrender.com`
- [ ] NOT to `/api/` on Vercel
- [ ] Response headers include CORS headers
- [ ] Images load from `nuttybites-backend.onrender.com/media/`

### 6. Console Errors
Open DevTools → Console:
- [ ] No CSRF errors
- [ ] No CORS errors
- [ ] No 404s for `/api/` endpoints
- [ ] No failed image loads

---

## Troubleshooting Guide

### Issue: Login returns 404
**Fix**: 
- Verify `VITE_API_URL` is set in Vercel
- Check Network tab - should call `https://nuttybites-backend.onrender.com/api/auth/login/`
- If calling `/api/auth/login/` on Vercel → env var not set correctly

### Issue: Products page is blank
**Fix**:
- Check browser console for errors
- Verify backend `/api/products/` endpoint works
- Check if images are loading (CORS headers)

### Issue: Images broken
**Fix**:
- Check image URLs in API response (should be absolute)
- Test image URL directly in browser
- Verify CORS headers on media files

### Issue: CSRF token errors
**Fix**:
- Should NOT happen (we exempted JWT endpoints)
- If you see this, check middleware order in `settings.py`
- Verify `CsrfExemptAPIMiddleware` is before `CsrfViewMiddleware`

### Issue: Database connection errors
**Fix**:
- Verify `DATABASE_URL` in Render
- Check if Supabase project is active
- Ensure `?pgbouncer=true` is in connection string

---

## Success Criteria

All these should work:
- ✅ Homepage loads with products
- ✅ User can register
- ✅ User can login
- ✅ Products page shows all items with images
- ✅ Product detail page works
- ✅ Add to cart works
- ✅ Cart persists after refresh
- ✅ No console errors
- ✅ No CORS errors
- ✅ No CSRF errors

---

## Rollback Plan

If something breaks:

### Backend (Render):
```bash
# Revert to previous deployment in Render dashboard
# Or push previous commit:
git revert HEAD
git push origin main
```

### Frontend (Vercel):
- Vercel Dashboard → Deployments
- Find previous working deployment
- Click "..." → "Promote to Production"

---

## Support Resources

1. **Backend Logs**: Render Dashboard → Logs
2. **Frontend Logs**: Vercel Dashboard → Deployments → Function Logs
3. **Database**: Supabase Dashboard → Database
4. **Documentation**: 
   - `docs/DEPLOYMENT.md`
   - `docs/PRODUCTION_FIXES.md`
   - `frontend/VERCEL_SETUP.md`

---

**Created**: 2026-02-01  
**Status**: Ready for production deployment 🎯  
**Estimated Time**: 15-20 minutes total

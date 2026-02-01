# Production Deployment Guide

## Overview
This guide covers deploying the Nectar & Nut E-commerce platform with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Supabase PostgreSQL

---

## Backend Deployment (Render)

### 1. Environment Variables
Set these in Render Dashboard → Environment:

```bash
# Django Settings
SECRET_KEY=es8!i-9m!id1)209=&oey8l81ugvbc+sd=m0dw%jty79hr1c&(
DEBUG=False
ALLOWED_HOSTS=nuttybites-backend.onrender.com

# Database
DATABASE_URL=postgres://postgres.ohxfkyczkrpxqdfypcgx:Newpas%40vit01@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Payment Gateway (Replace with production keys)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_live_secret

# Email Service (Replace with your domain)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=orders@yourdomain.com

# CORS - Frontend URL
FRONTEND_URL=https://dry-fruits-ecommerce.vercel.app
```

### 2. Build Command
```bash
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
```

### 3. Start Command
```bash
gunicorn config.wsgi:application
```

---

## Frontend Deployment (Vercel)

### 1. Environment Variables
Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Backend API URL - CRITICAL!
VITE_API_URL=https://nuttybites-backend.onrender.com/api

# Razorpay (Production Key)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx

# Supabase (if using)
VITE_SUPABASE_URL=https://ohxfkyczkrpxqdfypcgx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Important Note
The `.env.production` file is automatically used during Vercel builds. However, you MUST also set `VITE_API_URL` in Vercel's environment variables dashboard, as it takes precedence.

---

## Database Setup (Supabase)

### 1. Connection Pooling
✅ Already configured with PgBouncer for optimal performance.

### 2. Run Migrations
After deploying backend, run:
```bash
python manage.py migrate
```

### 3. Create Superuser
```bash
python manage.py createsuperuser
```

---

## Post-Deployment Checklist

### Backend (Render)
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Admin panel accessible at `/admin/`
- [ ] Health check passing: `https://nuttybites-backend.onrender.com/api/health/`

### Frontend (Vercel)
- [ ] `VITE_API_URL` environment variable set
- [ ] Build successful
- [ ] Can access homepage
- [ ] Can view products
- [ ] Can login/register

### Integration Tests
- [ ] User registration works
- [ ] Login returns JWT tokens
- [ ] Product list loads with images
- [ ] Product detail page shows data
- [ ] Add to cart works
- [ ] CORS headers present (check Network tab)
- [ ] No CSRF errors in console

---

## Troubleshooting

### Issue: Products not loading
**Check:**
1. Backend logs in Render dashboard
2. Database connection (check `DATABASE_URL`)
3. Network tab for API errors
4. CORS headers in response

### Issue: Authentication fails
**Check:**
1. `VITE_API_URL` is set correctly in Vercel
2. CSRF cookie settings (should have `SameSite=None` in production)
3. CORS allowed origins includes Vercel URL
4. JWT tokens in localStorage (DevTools → Application)

### Issue: Images not loading
**Check:**
1. Media files exist in backend `/media/` directory
2. WhiteNoise is serving files (check response headers)
3. CORS headers on media files (`Access-Control-Allow-Origin: *`)
4. Image URLs are absolute (should start with `https://`)

### Issue: Database connection errors
**Check:**
1. `DATABASE_URL` includes `?pgbouncer=true`
2. `DISABLE_SERVER_SIDE_CURSORS = True` in settings
3. Connection timeout settings
4. Supabase project is active

---

## Security Notes

### Production Settings Active:
- ✅ HTTPS redirect enabled
- ✅ Secure cookies (SameSite=None for cross-origin)
- ✅ HSTS headers
- ✅ XSS protection
- ✅ Content type sniffing protection
- ✅ Clickjacking protection (X-Frame-Options)

### API Security:
- ✅ JWT authentication
- ✅ CSRF exemption for JWT endpoints
- ✅ CORS properly configured
- ✅ Rate limiting (1000/min anonymous, 5000/min authenticated)

---

## Monitoring

### Health Checks
- Backend: `https://nuttybites-backend.onrender.com/api/health/`
- Expected response: `{"status": "ok"}`

### Logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Function Logs

---

## Scaling Considerations

### Current Setup:
- ✅ Stateless JWT (no session storage needed)
- ✅ Database connection pooling
- ✅ PgBouncer for efficient DB connections
- ✅ WhiteNoise for static files (no separate CDN needed)

### Future Enhancements:
- [ ] Move media files to S3/Cloudinary for better CDN
- [ ] Add Redis for caching
- [ ] Implement rate limiting per user
- [ ] Add monitoring (Sentry, New Relic)

---

## Contact & Support
For issues, check:
1. Backend logs in Render
2. Frontend logs in Vercel
3. Browser console (Network tab)
4. Django admin panel at `/admin/`

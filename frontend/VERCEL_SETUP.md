# ⚠️ IMPORTANT: Vercel Environment Variables Setup

## Critical Configuration

To make authentication and product loading work in production, you MUST set this environment variable in Vercel:

### Go to Vercel Dashboard:
1. Open your project: https://vercel.com/dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add the following:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_API_URL` | `https://nuttybites-backend.onrender.com/api` | Production |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_xxxxx` (use your production key) | Production |

### Why This Is Critical:

Without `VITE_API_URL`, the frontend will try to call `/api/` on Vercel, which doesn't exist. This causes:
- ❌ Login failures (404 errors)
- ❌ Product page blank (can't fetch data)
- ❌ All API calls fail

### After Setting:

1. Click **Save**
2. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push
   ```
   OR click **Redeploy** in Vercel dashboard

### Verify:

After deployment, open browser console on your production site and check:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should output: `https://nuttybites-backend.onrender.com/api`

If it shows `/api` or `undefined`, the environment variable wasn't set correctly.

---

## Optional: Preview/Development Environments

If you want different settings for preview deployments:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_API_URL` | `https://nuttybites-backend.onrender.com/api` | Preview |
| `VITE_API_URL` | `/api` | Development (local) |

---

## Troubleshooting

### Issue: Environment variable not working
**Solution**: 
- Ensure you're setting it for **Production** environment
- Redeploy after saving
- Check build logs in Vercel to see if variable is loaded

### Issue: Still getting `/api` in production
**Solution**:
- The `.env.production` file is a fallback
- Vercel dashboard variables take precedence
- Make sure variable name is exactly `VITE_API_URL` (case-sensitive)

---

**Last Updated**: 2026-02-01  
**Status**: Required for production deployment ⚠️

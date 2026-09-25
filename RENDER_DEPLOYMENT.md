# Render Deployment Guide for Habit Tracker PWA

## Prerequisites
- GitHub account with your habit-tracker-tech repository
- Render account (free at render.com)
- Supabase project URL and anon key

## Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Navigate to Project Settings → API
4. Copy:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon/public** key (this is your `VITE_SUPABASE_ANON_KEY`)

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)
1. Push the `render.yaml` file to your GitHub repository
2. Go to [render.com](https://render.com)
3. Click "New +"
4. Select "Web Service"
5. Connect your GitHub repository
6. Render will automatically detect the `render.yaml` configuration
7. Click "Deploy Web Service"

### Option B: Manual Configuration
1. Go to [render.com](https://render.com)
2. Click "New +"
3. Select "Static Site"
4. Configure:
   - **Name**: habit-tracker-pwa
   - **Branch**: main
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: 18

## Step 3: Set Environment Variables

After creating the service, add environment variables:

1. Go to your service in Render dashboard
2. Click "Environment" tab
3. Add these variables:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key

4. Click "Save Changes"
5. Render will automatically redeploy

## Step 4: Verify Deployment

1. Wait for deployment to complete (usually 2-3 minutes)
2. Visit your Render URL (e.g., `https://habit-tracker-pwa.onrender.com`)
3. Test:
   - App loads correctly
   - Can sign in/sign up
   - Habits work as expected
   - PWA install prompt appears

## Step 5: Test PWA Functionality

### HTTPS Check
Render automatically provides HTTPS - your URL will be `https://...`

### Service Worker Check
1. Open Chrome DevTools (F12)
2. Go to Application tab
3. Check "Service Workers" section
4. Verify service worker is active and running

### Offline Test
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh the page
4. Verify app loads and shows offline banner

### Installability Test
1. Open Chrome DevTools → Application tab
2. Check "Manifest" section
3. Verify manifest loads correctly
4. Look for install icon in address bar

## Step 6: Run Lighthouse Audit

1. Open your production URL in Chrome
2. Open DevTools → Lighthouse
3. Select categories:
   - Performance
   - Accessibility
   - Best Practices
   - PWA
4. Click "Analyze page load"
5. Target scores:
   - Performance: ≥90
   - Accessibility: ≥95
   - Best Practices: ≥90
   - PWA: ≥90

## Render Configuration Details

The `render.yaml` file includes:
- **Static site hosting** for optimal performance
- **Proper cache headers** for assets
- **Service worker cache bypass** for SW files
- **SPA routing** via rewrite rules
- **Node 18** for compatibility

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally
- Verify all dependencies are in package.json
- Check Render build logs for specific errors

### Environment Variables Not Working
- Ensure variables start with `VITE_` prefix
- Verify no typos in variable names
- Check that Render redeployed after adding variables

### Service Worker Not Registering
- Verify HTTPS is working (automatic on Render)
- Check service worker scope is root
- Clear browser cache and reload
- Check Console for SW registration errors

### PWA Not Installable
- Verify manifest loads correctly
- Check all icon sizes are present
- Ensure service worker is active
- Test on HTTPS only (HTTP won't work)

## Cost

Render Free Tier includes:
- 100GB bandwidth per month
- 750 hours of build time per month
- 3 concurrent builds
- SSL/HTTPS automatically included

## Next Steps After Deployment

1. **Monitor performance** in Render dashboard
2. **Set up custom domain** (optional)
3. **Configure analytics** (optional)
4. **Test on real devices** (iOS/Android)
5. **Submit to app stores** (optional, using PWA)

## Render URL Structure

Your app will be available at:
`https://your-service-name.onrender.com`

Example: `https://habit-tracker-pwa.onrender.com`
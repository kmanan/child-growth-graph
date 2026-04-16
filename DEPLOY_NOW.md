# Complete Deployment Guide - GitHub & Railway

## Current Status
âœ… Git repository initialized
âœ… All files committed
âœ… Ready to push to GitHub

## STEP 1: Push to GitHub

### A. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `cdc-growth-charts`
3. Description: `Modern web app for tracking children growth using WHO/CDC standards`
4. Choose Public or Private
5. **DO NOT** check "Initialize with README"
6. Click "Create repository"

### B. Push Your Code
After creating the repository, run these commands:

```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/cdc-growth-charts.git
git branch -M main
git push -u origin main
```

Example:
```powershell
git remote add origin https://github.com/johndoe/cdc-growth-charts.git
git branch -M main
git push -u origin main
```

## STEP 2: Deploy to Railway

### Option A: Deploy via GitHub (Recommended)

1. **Go to Railway**
   - Visit https://railway.app
   - Sign up or log in (you can use your GitHub account)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub
   - Select `cdc-growth-charts` repository

3. **Automatic Deployment**
   - Railway will automatically detect Next.js
   - It will install dependencies and build
   - Wait 2-3 minutes for deployment

4. **Get Your URL**
   - Click on your deployment
   - Go to "Settings" tab
   - Click "Generate Domain"
   - Your app will be live at: `your-app.railway.app`

### Option B: Deploy via Railway CLI

1. **Install Railway CLI**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login**
   ```powershell
   railway login
   ```

3. **Initialize and Deploy**
   ```powershell
   railway init
   railway up
   ```

4. **Get Domain**
   ```powershell
   railway domain
   ```

## STEP 3: Verify Deployment

Once deployed, visit your Railway URL and test:
1. Enter child information (name, sex, birth date)
2. Add a measurement (weight, length, head circumference)
3. Verify charts appear correctly
4. Test on mobile device

## Troubleshooting

### Git Issues
- If "remote already exists": `git remote remove origin` then try again
- If "permission denied": Check your GitHub credentials

### Railway Issues
- **Build fails**: Check Railway logs in dashboard
- **App won't start**: Verify package.json has correct start script
- **Blank page**: Check browser console for errors

### Need to Update?
After making changes:
```powershell
git add .
git commit -m "Update: description of changes"
git push
```
Railway will automatically redeploy!

## Environment Variables
No environment variables needed! The app runs entirely client-side.

## Custom Domain (Optional)
1. In Railway dashboard, go to Settings
2. Click "Add Custom Domain"
3. Enter your domain
4. Update DNS records as instructed

## Cost
- **GitHub**: Free for public repositories
- **Railway**: Free tier includes:
  - $5 credit per month
  - Should be sufficient for this app
  - Upgrade if needed for more traffic

## Your URLs
After deployment, save these:
- GitHub: https://github.com/YOUR_USERNAME/cdc-growth-charts
- Railway: https://your-app.railway.app

## Next Steps
1. Share your app URL with users
2. Monitor usage in Railway dashboard
3. Check GitHub for any issues
4. Consider adding:
   - Google Analytics
   - Custom domain
   - More features

---
Created: October 2025

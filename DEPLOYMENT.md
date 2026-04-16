# Railway Deployment Guide

## Quick Deploy to Railway

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CDC Growth Charts"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect Next.js and deploy

3. **Configure Environment**:
   - Railway will automatically set PORT
   - No additional environment variables needed

### Option 2: Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize and Deploy**:
   ```bash
   railway init
   railway up
   ```

4. **Get URL**:
   ```bash
   railway domain
   ```

## Environment Variables

No environment variables are required for basic operation.

## Build Configuration

Railway will automatically:
- Detect Node.js 20
- Run `npm install`
- Run `npm run build`
- Start with `npm start`

## Custom Domain

1. Go to your Railway project
2. Click on "Settings"
3. Add your custom domain
4. Update DNS records as instructed

## Monitoring

- View logs in Railway dashboard
- Check deployment status
- Monitor resource usage

## Troubleshooting

### Build Fails
- Check that Node.js version is 18+
- Verify all dependencies are in package.json
- Check build logs in Railway dashboard

### App Won't Start
- Ensure PORT environment variable is used
- Check that `npm start` works locally
- Review Railway logs

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit http://localhost:3000

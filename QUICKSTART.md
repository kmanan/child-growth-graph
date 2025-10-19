# Quick Start Guide

## What You Have

A complete, modern web application for CDC/WHO growth charts that works on desktop and mobile with beautiful Recharts visualizations.

## Deploy to Railway (5 minutes)

### Step 1: Push to GitHub
```bash
cd C:\Users\manan\cdc-growth-charts
git init
git add .
git commit -m "Initial commit: CDC Growth Charts"
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to https://railway.app
2. Sign up/login (free tier available)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your cdc-growth-charts repo
6. Railway automatically detects Next.js and deploys
7. Get your URL from the Railway dashboard

## Local Development (if you have Node.js)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Key Features

- Track weight, length, and head circumference
- Beautiful interactive charts with percentile curves
- WHO/CDC standards with gradual transition
- Mobile responsive design
- No database needed

## Files Reference

- app/page.tsx - Main application
- components/MeasurementForm.tsx - Data entry
- components/GrowthChart.tsx - Visualizations
- lib/growthCalculations.ts - LMS calculations
- lib/growthData.ts - WHO/CDC data

## Success!

Your app is ready to deploy on Railway.com!

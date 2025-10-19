# GitHub Push Script
# Replace YOUR_GITHUB_URL with your actual repository URL

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan

# Example: git remote add origin https://github.com/yourusername/cdc-growth-charts.git
# Uncomment and replace with your URL:
# git remote add origin YOUR_GITHUB_URL_HERE

git branch -M main
git push -u origin main

Write-Host "`nSuccess! Your code is now on GitHub!" -ForegroundColor Green

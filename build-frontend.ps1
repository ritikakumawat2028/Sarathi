#!/bin/bash
# ============================================================
# build-frontend.ps1 (run this on YOUR LOCAL MACHINE - Windows)
# 
# USAGE:
#   1. Replace EC2_IP with your actual EC2 public IP
#   2. Run: ./build-frontend.ps1
#   3. Upload the `frontend/dist/` folder to S3
# ============================================================

$EC2_IP = "REPLACE_WITH_YOUR_EC2_PUBLIC_IP"

Write-Host "===== Building frontend for production =====" -ForegroundColor Cyan

# Create .env.production with EC2 backend URL
Set-Content -Path "frontend\.env.production" -Value "VITE_API_BASE_URL=http://$EC2_IP/api"

Write-Host "Created frontend/.env.production pointing to http://$EC2_IP/api" -ForegroundColor Green

# Install dependencies and build
Set-Location frontend
npm install
npm run build
Set-Location ..

Write-Host ""
Write-Host "===== Build complete! =====" -ForegroundColor Green
Write-Host "Upload the contents of frontend/dist/ to your S3 bucket" -ForegroundColor Yellow
Write-Host ""
Write-Host "AWS S3 Upload Command (requires AWS CLI):" -ForegroundColor Cyan
Write-Host "  aws s3 sync frontend/dist/ s3://YOUR-BUCKET-NAME/ --delete"

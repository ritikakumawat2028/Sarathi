#!/bin/bash
# ==============================================================================
# Sarathi AI - Automated AWS EC2 Ubuntu Production Deployment Script
# Run this script on a fresh Ubuntu 22.04 / 24.04 LTS EC2 instance
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "📦 [2/6] Installing Node.js v20 LTS, Git, and Nginx..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx build-essential

echo "⚙️ [3/6] Installing PM2 process manager globally..."
sudo npm install -g pm2

echo "📂 [4/6] Installing dependencies & building Backend..."
cd "$(dirname "$0")/../backend"
npm install --production=false

echo "📂 [5/6] Installing dependencies & building Frontend..."
cd ../frontend
npm install --production=false
npm run build

echo "🌐 [6/6] Configuring Nginx..."
sudo cp ../deploy/nginx/sarathi.conf /etc/nginx/sites-available/sarathi
sudo ln -sf /etc/nginx/sites-available/sarathi /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "=============================================================================="
echo "✅ Setup Complete!"
echo "Next steps:"
echo "1. Create production environment file in backend directory: nano backend/.env"
echo "2. Start Backend using PM2: cd backend && pm2 start ecosystem.config.cjs --env production"
echo "3. Save PM2 startup list: pm2 save && pm2 startup"
echo "=============================================================================="

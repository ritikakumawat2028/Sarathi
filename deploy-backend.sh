#!/bin/bash
# ============================================================
# deploy-backend.sh
# Run this ONCE on your fresh EC2 Ubuntu 22.04 instance.
# Usage: bash deploy-backend.sh
# ============================================================

set -e

echo "===== [1/6] Updating system packages ====="
sudo apt-get update -y && sudo apt-get upgrade -y

echo "===== [2/6] Installing Node.js 20 ====="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "===== [3/6] Installing PM2 and Nginx ====="
sudo npm install -g pm2
sudo apt-get install -y nginx

echo "===== [4/6] Cloning repository ====="
cd ~
git clone https://github.com/ritikakumawat2028/Sarathi.git
cd Sarathi/backend
npm install

echo "===== [5/6] Setting up Nginx ====="
sudo cp ~/Sarathi/nginx.conf /etc/nginx/sites-available/sarathi
sudo ln -sf /etc/nginx/sites-available/sarathi /etc/nginx/sites-enabled/sarathi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "===== [6/6] DONE ====="
echo ""
echo "============================================================"
echo " NEXT STEPS:"
echo "============================================================"
echo " 1. Create your .env file:"
echo "    nano ~/Sarathi/backend/.env"
echo "    (Copy from .env.example and fill in your values)"
echo ""
echo " 2. Start the backend with PM2:"
echo "    cd ~/Sarathi/backend"
echo "    pm2 start src/index.js --name sarathi-backend"
echo "    pm2 save"
echo "    pm2 startup"
echo ""
echo " 3. Test: curl http://localhost:4000/health"
echo "    Should return: {\"status\":\"ok\"}"
echo "============================================================"

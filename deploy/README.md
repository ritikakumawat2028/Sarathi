# 🚀 Sarathi AI - AWS Deployment Guide

This directory contains automated scripts and configuration templates to quickly host the complete **Sarathi AI** full-stack application on Amazon Web Services (AWS EC2).

---

## 📁 What's Inside?
- `setup-ec2.sh`: Automated setup bash script for fresh Ubuntu 22.04/24.04 EC2 instances (installs Node.js v20, Nginx, PM2, and builds both backend & frontend).
- `nginx/sarathi.conf`: Nginx configuration template for reverse-proxying `localhost:4000` (`/api`) and serving the React `dist/` production bundle on Port 80.
- `../backend/ecosystem.config.cjs`: PM2 process manager configuration to keep the Express backend running 24/7 with automatic restarts.

---

## 🛠️ Step-by-Step EC2 Deployment

### 1. Launch EC2 Instance
- Launch an **Ubuntu Server 24.04 LTS** instance (`t3.small` or `t2.micro`).
- Open security group ports: **22 (SSH)**, **80 (HTTP)**, and **443 (HTTPS)**.

### 2. Connect & Clone Repository
SSH into your instance and clone the repo:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
git clone https://github.com/ritikakumawat2028/Sarathi.git
cd Sarathi
```

### 3. Run Automated Setup Script
Run the automated installation and build script:
```bash
bash deploy/setup-ec2.sh
```

### 4. Configure Production Environment Variables
Create the `.env` file for the backend:
```bash
nano backend/.env
```
Paste your production settings:
```env
PORT=4000
NODE_ENV=production
CLIENT_ORIGIN=http://<YOUR_EC2_PUBLIC_IP>
JWT_SECRET=your-secure-production-jwt-secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
MONGODB_URI=YOUR_MONGODB_URI_HERE
```

### 5. Start Backend with PM2
```bash
cd backend
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

Your full-stack application (`http://<YOUR_EC2_PUBLIC_IP>`) is now live on AWS!

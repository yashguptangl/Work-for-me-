# AWS EC2 Deployment Guide - Complete Step by Step

## 📋 Prerequisites
- AWS Account
- Domain name (optional but recommended)
- Basic terminal knowledge

## 🎯 Overview
This guide will help you deploy:
- **Next.js Web App** (apps/web) - Port 3000
- **HTTP Server** (apps/http-server) - Port 5000

---

## 1️⃣ EC2 Instance Setup

### Step 1.1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to EC2 Dashboard
   - Click "Launch Instance"

2. **Configure Instance:**
   - **Name**: `rooms-dekho-production`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier Eligible)
   - **Instance Type**: `t2.medium` (minimum recommended)
     - t2.micro (1GB RAM) - For testing only
     - t2.small (2GB RAM) - Minimum for production
     - **t2.medium (4GB RAM) - RECOMMENDED** ✅
     - t2.large (8GB RAM) - For high traffic

3. **Key Pair:**
   - Create new key pair
   - Name: `rooms-dekho-key`
   - Type: RSA
   - Format: `.pem` (for SSH)
   - **Download and save securely** (you can't download it again!)

4. **Network Settings - IMPORTANT!**

---

## 2️⃣ Security Group Configuration (CRITICAL!)

### Step 2.1: Create Security Group Rules

Click "Edit" on Network Settings and configure:

#### **INBOUND RULES** (Allow incoming traffic)

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP (or specific IP) | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0, ::/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0, ::/0 | Secure web traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Next.js (temporary - remove after Nginx) |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | HTTP Server (temporary - remove after Nginx) |

**Configuration Steps:**
```
1. SSH (Port 22)
   - Click "Add Security Group Rule"
   - Type: SSH
   - Source: My IP (automatically detects your IP)
   - ⚠️ NEVER use 0.0.0.0/0 for SSH in production!

2. HTTP (Port 80)
   - Type: HTTP
   - Source: Anywhere IPv4 (0.0.0.0/0)
   - Source: Anywhere IPv6 (::/0)

3. HTTPS (Port 443)
   - Type: HTTPS
   - Source: Anywhere IPv4 (0.0.0.0/0)
   - Source: Anywhere IPv6 (::/0)

4. Custom TCP 3000 (Next.js)
   - Type: Custom TCP
   - Port: 3000
   - Source: 0.0.0.0/0
   - Note: Remove this after Nginx setup

5. Custom TCP 5000 (HTTP Server)
   - Type: Custom TCP
   - Port: 5000
   - Source: 0.0.0.0/0
   - Note: Remove this after Nginx setup
```

#### **OUTBOUND RULES** (Allow outgoing traffic)

Default outbound rule is usually sufficient:

| Type | Protocol | Port Range | Destination | Description |
|------|----------|------------|-------------|-------------|
| All traffic | All | All | 0.0.0.0/0 | Allow all outbound |

**✅ This allows your server to:**
- Download packages (npm, apt)
- Make API calls
- Connect to databases
- Send emails

---

### Step 2.2: Storage Configuration

- **Size**: 20 GB minimum (30 GB recommended)
- **Type**: gp3 (General Purpose SSD)

### Step 2.3: Launch Instance

- Review all settings
- Click "Launch Instance"
- Wait 2-3 minutes for instance to start
- Note down your **Public IPv4 Address**

---

## 3️⃣ Connect to EC2 Instance

### Step 3.1: Connect via SSH (Windows)

```powershell
# Move your .pem key to a safe location
Move-Item .\rooms-dekho-key.pem C:\Users\YourName\.ssh\

# Set proper permissions
icacls C:\Users\YourName\.ssh\rooms-dekho-key.pem /inheritance:r
icacls C:\Users\YourName\.ssh\rooms-dekho-key.pem /grant:r "%username%:R"

# Connect to EC2
ssh -i C:\Users\YourName\.ssh\rooms-dekho-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP.

### Alternative: Use PuTTY (Windows)

1. Download PuTTY and PuTTYgen
2. Convert .pem to .ppk using PuTTYgen
3. Use PuTTY to connect

---

## 4️⃣ Server Initial Setup

### Step 4.1: Update System

```bash
# Update package list
sudo apt update

# Upgrade packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 4.2: Install Node.js (RECOMMENDED VERSION)

**✅ Use Node.js v20.x LTS (Long Term Support)**

```bash
# Install Node.js 20.x LTS (RECOMMENDED)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x

# Install pnpm (if you're using pnpm)
sudo npm install -g pnpm

# Install Yarn (if you're using yarn)
sudo npm install -g yarn
```

**Node.js Version Compatibility:**
- ✅ **Node 20.x LTS** - RECOMMENDED (stable, long-term support)
- ✅ Node 18.x LTS - Also good
- ⚠️ Node 22.x - Latest but may have compatibility issues
- ❌ Node 16.x - End of life, not recommended

---

## 5️⃣ Install and Configure PM2

PM2 is a process manager that keeps your apps running 24/7.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on system boot
pm2 startup systemd
# Copy and run the command that PM2 outputs

# Save PM2 configuration
pm2 save
```

---

## 6️⃣ Install and Configure PostgreSQL (Database)

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE roomsdekho;
CREATE USER roomsdekho_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE roomsdekho TO roomsdekho_user;
\q
```

---

## 7️⃣ Clone and Setup Your Project

### Step 7.1: Setup Git (if private repo)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# View public key
cat ~/.ssh/id_ed25519.pub

# Copy the output and add to GitHub: Settings > SSH Keys
```

### Step 7.2: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/your-username/Rooms-Dekho.git

# Or with SSH
git clone git@github.com:your-username/Rooms-Dekho.git

# Navigate to project
cd Rooms-Dekho
```

### Step 7.3: Install Dependencies

```bash
# Install all dependencies
npm install

# Or if using pnpm
pnpm install

# Or if using yarn
yarn install
```

---

## 8️⃣ Configure Environment Variables

### Step 8.1: HTTP Server Environment

```bash
# Create .env file for HTTP server
nano apps/http-server/.env
```

Add the following:

```env
# Database
DATABASE_URL="postgresql://roomsdekho_user:your_secure_password@localhost:5432/roomsdekho"

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters-long"

# CORS
CORS_ORIGIN="https://yourdomain.com"

# Other API keys
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
# ... add all your environment variables
```

### Step 8.2: Web App Environment

```bash
# Create .env file for web app
nano apps/web/.env.local
```

Add the following:

```env
# API URL
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
# Or for testing: http://YOUR_EC2_IP:5000

# Database (if web app needs direct access)
DATABASE_URL="postgresql://roomsdekho_user:your_secure_password@localhost:5432/roomsdekho"

# Other environment variables
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
# ... add all your environment variables
```

---

## 9️⃣ Setup Prisma Database

```bash
# Generate Prisma Client
cd ~/Rooms-Dekho/packages/prisma
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npm run seed
```

---

## 🔟 Build and Start Applications

### Step 10.1: Build HTTP Server

```bash
cd ~/Rooms-Dekho/apps/http-server

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name "http-server" --node-args="--max-old-space-size=2048"
```

### Step 10.2: Build Next.js Web App

```bash
cd ~/Rooms-Dekho/apps/web

# Build Next.js
npm run build

# Start with PM2
pm2 start npm --name "web-app" -- start
```

### Step 10.3: Manage PM2 Processes

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# View specific app logs
pm2 logs web-app
pm2 logs http-server

# Restart apps
pm2 restart all

# Stop apps
pm2 stop all

# Delete apps from PM2
pm2 delete all

# Save current PM2 configuration
pm2 save
```

---

## 1️⃣1️⃣ Install and Configure Nginx (Reverse Proxy)

Nginx will handle:
- Reverse proxy to your apps
- SSL/HTTPS certificates
- Load balancing
- Static file serving

### Step 11.1: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 11.2: Configure Nginx for Your Apps

```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/rooms-dekho
```

Add the following configuration:

```nginx
# HTTP Server (API) Configuration
server {
    listen 80;
    server_name api.yourdomain.com;  # Replace with your API domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Web App (Next.js) Configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 11.3: Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/rooms-dekho /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 11.4: Configure Firewall (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

---

## 1️⃣2️⃣ Setup SSL Certificate (HTTPS)

### Step 12.1: Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Step 12.2: Obtain SSL Certificate

```bash
# Get certificate for web domain
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Get certificate for API domain
sudo certbot --nginx -d api.yourdomain.com

# Follow the prompts:
# 1. Enter your email
# 2. Agree to terms
# 3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

### Step 12.3: Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job for renewal
# Check with:
sudo systemctl status certbot.timer
```

---

## 1️⃣3️⃣ Domain Configuration (DNS Settings)

Configure your domain DNS (in your domain registrar):

### For Web App:
```
Type: A Record
Name: @ (or yourdomain.com)
Value: YOUR_EC2_PUBLIC_IP
TTL: 3600

Type: A Record
Name: www
Value: YOUR_EC2_PUBLIC_IP
TTL: 3600
```

### For API:
```
Type: A Record
Name: api
Value: YOUR_EC2_PUBLIC_IP
TTL: 3600
```

⏰ **Wait 5-30 minutes for DNS propagation**

---

## 1️⃣4️⃣ Security Hardening (IMPORTANT!)

### Step 14.1: Update Security Groups (After Nginx Setup)

Go back to AWS Console > EC2 > Security Groups:

**REMOVE these inbound rules:**
- Port 3000 (Next.js direct access)
- Port 5000 (HTTP Server direct access)

**Keep only:**
- Port 22 (SSH) - From your IP only
- Port 80 (HTTP)
- Port 443 (HTTPS)

### Step 14.2: Change SSH Port (Optional but Recommended)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find line: #Port 22
# Change to: Port 2222 (or any port you prefer)

# Restart SSH
sudo systemctl restart sshd

# Update Security Group to allow new port
# Don't forget to test new port before closing current session!
```

### Step 14.3: Disable Root Login

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Find and set:
PermitRootLogin no
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### Step 14.4: Setup Fail2Ban (Prevent Brute Force)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit config
sudo nano /etc/fail2ban/jail.local

# Set:
# [sshd]
# enabled = true
# maxretry = 3
# bantime = 3600

# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 1️⃣5️⃣ Monitoring and Maintenance

### Step 15.1: Setup PM2 Monitoring

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Step 15.2: Monitor Server Resources

```bash
# View CPU and Memory usage
htop

# Install htop if not available
sudo apt install -y htop

# View PM2 monitoring
pm2 monit
```

### Step 15.3: Check Application Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs

# Nginx status
sudo systemctl status nginx

# PostgreSQL status
sudo systemctl status postgresql
```

---

## 1️⃣6️⃣ Deployment Checklist

- [ ] EC2 instance created with proper size (t2.medium recommended)
- [ ] Security Groups configured correctly
- [ ] SSH key pair downloaded and saved
- [ ] Connected to EC2 via SSH
- [ ] System updated (apt update && upgrade)
- [ ] Node.js 20.x LTS installed
- [ ] PM2 installed and configured
- [ ] PostgreSQL installed and database created
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment variables configured (.env files)
- [ ] Prisma migrations run
- [ ] Applications built successfully
- [ ] PM2 processes started
- [ ] Nginx installed and configured
- [ ] Domain DNS configured
- [ ] SSL certificates installed (Certbot)
- [ ] Security groups updated (removed 3000 and 5000)
- [ ] Firewall (UFW) configured
- [ ] Fail2Ban installed
- [ ] PM2 startup script configured
- [ ] Applications accessible via domain

---

## 1️⃣7️⃣ Useful Commands Reference

### PM2 Commands
```bash
pm2 list                    # List all processes
pm2 restart all            # Restart all processes
pm2 stop all               # Stop all processes
pm2 delete all             # Delete all processes
pm2 logs                   # View logs
pm2 logs web-app           # View specific app logs
pm2 monit                  # Monitor resources
pm2 save                   # Save current process list
```

### Nginx Commands
```bash
sudo systemctl start nginx      # Start Nginx
sudo systemctl stop nginx       # Stop Nginx
sudo systemctl restart nginx    # Restart Nginx
sudo systemctl reload nginx     # Reload configuration
sudo nginx -t                   # Test configuration
sudo tail -f /var/log/nginx/error.log  # View error logs
```

### System Commands
```bash
df -h                      # Check disk space
free -h                    # Check memory usage
htop                       # System monitor
sudo ufw status            # Firewall status
```

---

## 1️⃣8️⃣ Troubleshooting

### Issue: Cannot connect to EC2
- Check Security Group has SSH (Port 22) enabled
- Verify you're using correct .pem key
- Check your IP is allowed in Security Group

### Issue: Applications not starting
```bash
# Check PM2 logs
pm2 logs

# Check if port is already in use
sudo lsof -i :3000
sudo lsof -i :5000

# Check environment variables
cat apps/web/.env.local
cat apps/http-server/.env
```

### Issue: Nginx not working
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check if Nginx is running
sudo systemctl status nginx
```

### Issue: Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U roomsdekho_user -d roomsdekho -h localhost

# Check DATABASE_URL in .env files
```

### Issue: SSL Certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nano /etc/nginx/sites-available/rooms-dekho
```

---

## 1️⃣9️⃣ Updating Your Application

When you push new changes:

```bash
# SSH into EC2
ssh -i ~/.ssh/rooms-dekho-key.pem ubuntu@YOUR_EC2_IP

# Navigate to project
cd ~/Rooms-Dekho

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild applications
cd apps/http-server && npm run build
cd ../web && npm run build

# Restart PM2 processes
pm2 restart all

# Check status
pm2 status
pm2 logs
```

---

## 2️⃣0️⃣ Cost Optimization Tips

1. **Use AWS Free Tier** (t2.micro for 12 months)
2. **Stop instance when not in use** (development)
3. **Use Reserved Instances** (production, 1-3 year commitment)
4. **Monitor AWS billing dashboard** regularly
5. **Use CloudWatch** for monitoring and alerts
6. **Enable automated backups** only for production
7. **Use S3 for file storage** instead of EC2 storage

---

## 📱 Testing Your Deployment

### Test HTTP Server (API)
```bash
# From your local machine
curl http://YOUR_EC2_IP:5000/health
# or with domain
curl https://api.yourdomain.com/health
```

### Test Web App
- Open browser: `http://YOUR_EC2_IP:3000`
- Or with domain: `https://yourdomain.com`

---

## 🎉 Congratulations!

Your application is now deployed on AWS EC2! 

### Next Steps:
1. Setup automated backups
2. Configure CloudWatch monitoring
3. Setup CI/CD pipeline (GitHub Actions)
4. Configure error tracking (Sentry)
5. Setup automated testing

---

## 📞 Support

If you face any issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `sudo journalctl -xe`

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Let's Encrypt](https://letsencrypt.org/)

---

**Author**: Deployment Guide for Rooms-Dekho
**Last Updated**: February 2026
**Version**: 1.0

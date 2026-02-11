# Deployment Guide

This guide covers deploying the Legal Signing System to a production environment.

## Prerequisites

- Ubuntu 20.04+ server (or similar Linux distribution)
- Domain name with DNS configured
- Minimum 2GB RAM, 20GB SSD storage
- Root or sudo access

## System Requirements

- Node.js 18+
- PostgreSQL 14+
- Nginx
- PM2 (process manager)
- SSL certificate (Let's Encrypt recommended)

## Step 1: Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be 18+
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2
```bash
sudo npm install -g pm2
```

## Step 2: Database Setup

### Create Database and User
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE legal_signing_db;
CREATE USER legal_signing_user WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE legal_signing_db TO legal_signing_user;
\q
```

### Configure PostgreSQL for Remote Access (if needed)
Edit `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = 'localhost'
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:
```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Step 3: Application Deployment

### Create Application User
```bash
sudo adduser --system --group --home /opt/legal-signing legal-signing
```

### Clone Repository
```bash
sudo -u legal-signing git clone <repository-url> /opt/legal-signing/app
cd /opt/legal-signing/app
```

### Install Dependencies
```bash
# Backend
cd backend
npm install --production

# Frontend
cd ../frontend
npm install
```

### Configure Environment Variables

Create `/opt/legal-signing/app/backend/.env`:
```bash
sudo -u legal-signing nano /opt/legal-signing/app/backend/.env
```

Add the following:
```env
# Database
DATABASE_URL="postgresql://legal_signing_user:your-secure-password@localhost:5432/legal_signing_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-CHANGE-THIS"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-CHANGE-THIS"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (Update with your SMTP settings)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
EMAIL_FROM="Legal Signing System <noreply@yourdomain.com>"

# Application
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://yourdomain.com"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="https://yourdomain.com"
```

### Run Database Migrations
```bash
cd /opt/legal-signing/app/backend
npx prisma migrate deploy
npx prisma generate
```

### Build Applications
```bash
# Build backend
cd /opt/legal-signing/app/backend
npm run build

# Build frontend
cd /opt/legal-signing/app/frontend
npm run build
```

## Step 4: PM2 Configuration

Create PM2 ecosystem file:
```bash
sudo -u legal-signing nano /opt/legal-signing/app/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'legal-signing-api',
    cwd: '/opt/legal-signing/app/backend',
    script: 'dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/opt/legal-signing/logs/api-error.log',
    out_file: '/opt/legal-signing/logs/api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

### Start Application with PM2
```bash
sudo mkdir -p /opt/legal-signing/logs
sudo chown -R legal-signing:legal-signing /opt/legal-signing

sudo -u legal-signing pm2 start /opt/legal-signing/app/ecosystem.config.js
sudo -u legal-signing pm2 save
sudo pm2 startup systemd -u legal-signing --hp /opt/legal-signing
```

### Verify Application is Running
```bash
sudo -u legal-signing pm2 status
sudo -u legal-signing pm2 logs
```

## Step 5: Nginx Configuration

### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/legal-signing
```

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Update paths after obtaining certificate)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend (Static Files)
    root /opt/legal-signing/app/frontend/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload Files
    location /uploads {
        alias /opt/legal-signing/app/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend Routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static Assets Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/legal-signing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete certificate installation.

### Auto-Renewal
Certbot automatically sets up renewal. Verify:
```bash
sudo certbot renew --dry-run
```

## Step 7: Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Step 8: Backup Configuration

### Database Backups

Create backup script `/opt/legal-signing/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/legal-signing/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U legal_signing_user legal_signing_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/legal-signing/app/backend/uploads

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule with cron:
```bash
chmod +x /opt/legal-signing/backup.sh
sudo crontab -e
```

Add daily backup at 2 AM:
```
0 2 * * * /opt/legal-signing/backup.sh >> /opt/legal-signing/logs/backup.log 2>&1
```

## Step 9: Monitoring

### PM2 Monitoring
```bash
sudo -u legal-signing pm2 monit
```

### Check Logs
```bash
# Application logs
sudo -u legal-signing pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### System Monitoring
```bash
# CPU and Memory
htop

# Disk usage
df -h

# Check services
sudo systemctl status nginx
sudo systemctl status postgresql
```

## Step 10: Updates and Maintenance

### Update Application
```bash
cd /opt/legal-signing/app
sudo -u legal-signing git pull

# Backend
cd backend
npm install --production
npx prisma migrate deploy
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# Restart
sudo -u legal-signing pm2 restart all
```

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update packages
npm update
```

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
sudo -u legal-signing pm2 logs

# Check database connection
psql -U legal_signing_user -d legal_signing_db -h localhost

# Verify environment variables
cat /opt/legal-signing/app/backend/.env
```

### 502 Bad Gateway
```bash
# Check if API is running
sudo -u legal-signing pm2 status

# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Test connection
psql -U legal_signing_user -d legal_signing_db -h localhost
```

## Security Checklist

- [ ] Strong database passwords
- [ ] JWT secrets are random and secure
- [ ] SSL certificate installed and valid
- [ ] Firewall configured (UFW)
- [ ] Regular backups scheduled
- [ ] SSH key-based authentication
- [ ] Disable root login
- [ ] Keep system updated
- [ ] Monitor logs regularly
- [ ] Set up fail2ban (optional)

## Performance Optimization

### PostgreSQL Tuning
Edit `/etc/postgresql/14/main/postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Nginx Caching
Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    # ... other proxy settings
}
```

## Support

For issues or questions:
- Check logs: `/opt/legal-signing/logs/`
- Review documentation: [ARCHITECTURE.md](./ARCHITECTURE.md)
- GitHub Issues: <repository-url>/issues

---

**Congratulations!** Your Legal Signing System is now deployed and running in production.

#!/bin/bash
#export PM2_HOME=/root/.pm2
source "/root/.nvm/nvm.sh"
nvm use 22

pm2 delete wt_frontend || true
pm2 delete wt_backend || true

# --- Frontend ---
cd "/home/ec2-user/webapps/worktracker/frontend"
npm install
npm run build

# --- Backend ---
cd "/home/ec2-user/webapps/worktracker/backend"
npm install
pm2 start npm --name wt_backend -- run dev
pm2 save

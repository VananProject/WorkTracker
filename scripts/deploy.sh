#!/bin/bash
source "/root/.nvm/nvm.sh"
nvm use 22

pm2 delete frontend || true
pm2 delete backend || true

# --- Frontend ---
cd "/home/ec2-user/webapps/worktracker/frontend"
npm install
pm2 start npm --name wt_frontend -- run build

# --- Backend ---
cd "/home/ec2-user/webapps/worktracker/backend"
npm install
pm2 start npm --name wt_backend -- run dev
pm2 save

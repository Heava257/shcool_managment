# Deployment Guide for Railway

This guide will help you deploy your Monorepo (Laravel + React) to Railway.

## Architecture
You will need to create **2 Services** and **1 Database** on Railway.
1. **MySQL** (Database)
2. **Laravel Backend** (API)
3. **React Frontend** (UI)

---

## Step 1: Push Changes
I have already updated your code to be "Deployment Ready".
1. `web-react/util/config.js` now reads from Environment Variables.
2. `web-react/package.json` now has a `start` script for Railway.

**You need to push these changes to GitHub first:**
```bash
git add .
git commit -m "Prepare for Railway Deployment"
git push
```

---

## Step 2: Database Setup
1. You already have a **MySQL** service on Railway.
2. Click on it, go to the **Connect** tab.
3. Note down the variables: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_URL`.

---

## Step 3: Deploy Backend (Laravel)
1. In Railway, click **New** -> **GitHub Repo** -> Select `shcool_managment`.
2. Do **not** deploy immediately if possible, or let it fail first.
3. Go to the new Service's **Settings**:
   - **Root Directory**: `/laravel-api` (CRITICAL STEP)
   - **Build Command**: `composer install --no-dev --optimize-autoloader` (Usually automatic)
   - **Start Command**: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`
4. Go to **Variables** tab and add:
   - `APP_KEY`: Generate one locally (`php artisan key:generate --show`) and paste it here.
   - `APP_URL`: `https://<your-railway-url>.up.railway.app`
   - `DB_CONNECTION`: `mysql`
   - `DB_HOST`: `${{MySQL.MYSQL_HOST}}` (Use Railway's variable picker)
   - `DB_PORT`: `${{MySQL.MYSQL_PORT}}`
   - `DB_DATABASE`: `${{MySQL.MYSQL_DATABASE}}`
   - `DB_USERNAME`: `${{MySQL.MYSQL_USER}}`
   - `DB_PASSWORD`: `${{MySQL.MYSQL_PASSWORD}}`
   - `FILESYSTEM_DISK`: `public`
5. **Redeploy**.

---

## Step 4: Deploy Frontend (React)
1. In Railway, click **New** -> **GitHub Repo** -> Select `shcool_managment` (AGAIN).
2. Go to this new Service's **Settings** (Rename it to "Frontend"):
   - **Root Directory**: `/web-react` (CRITICAL STEP)
   - **Start Command**: `npm run start`
   - **Networking**: click **Generate Domain** to get a public URL.
3. Go to **Variables** tab and add:
   - `VITE_API_BASE_URL`: `https://<YOUR-BACKEND-URL-FROM-STEP-3>/api/`
   - `VITE_IMAGE_BASE_URL`: `https://<YOUR-BACKEND-URL-FROM-STEP-3>/storage/`
4. **Redeploy**.

---

## Troubleshoot
- **Images not loading?**
  You might need to run `php artisan storage:link` in the backend. 
  In Railway, you can often run this as part of the Start Command, or connect via CLI. 
  The start command `php artisan migrate --force && php artisan storage:link && php artisan serve ...` is safer.

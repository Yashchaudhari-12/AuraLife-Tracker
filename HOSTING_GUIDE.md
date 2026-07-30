# 🌐 Free Live Hosting Guide for AuraLife Tracker

Your AuraLife web app is now fully upgraded with **Firebase Cloud Authentication** and **Real-Time Database Syncing**.

You can deploy it live on the web for **100% free** in less than 3 minutes so you can open it on your phone during college and on your laptop at home!

---

## ⚡ Method 1: Deploying with Vercel (Fastest - 1 Minute)

1. Open your browser and go to **[vercel.com](https://vercel.com)** (sign up for a free account if you haven't already).
2. Install Vercel CLI via terminal (or use their web dashboard):
   ```bash
   npx vercel
   ```
3. Follow the 3 prompts in your terminal:
   - *Set up and deploy?* **Y**
   - *Which scope?* (Select your account)
   - *Link to existing project?* **N**
   - *What's your project name?* **auralife-tracker**
4. Done! Vercel will give you a live production URL like `https://auralife-tracker.vercel.app`.

---

## 🐙 Method 2: Deploying with GitHub Pages (Free & Reliable)

1. Initialize git in your project directory:
   ```bash
   cd /home/yash_chaudhari/.gemini/antigravity/scratch/life-attendance-tracker
   git init
   git add .
   git commit -m "Deploying AuraLife Tracker"
   ```
2. Create a new repository on GitHub named `auralife-tracker`.
3. Link and push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/auralife-tracker.git
   git push -u origin main
   ```
4. Go to your repository on GitHub: **Settings -> Pages -> Branch: main -> Save**.
5. Your app will be live at: `https://YOUR_GITHUB_USERNAME.github.io/auralife-tracker/`!

---

## 🔥 Optional: Using Your Own Private Firebase Project Credentials

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and click **Add Project**.
2. Click **Add Web App (`</>`)**.
3. Copy your project's `apiKey`, `authDomain`, and `projectId`.
4. Open your live AuraLife app, click **`☁️ Sign In / Cloud Sync`** -> **`⚙️ Configure Custom Firebase Keys`**, paste your credentials, and click Save!

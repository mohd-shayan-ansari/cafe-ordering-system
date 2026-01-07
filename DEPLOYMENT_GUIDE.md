# Deployment Guide

## ✅ Step 1: Push to GitHub

### Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (e.g., `cafe-ordering-system`)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)

### Push Your Code
```bash
cd "F:\cafe website\cafe-app"
git remote add origin https://github.com/YOUR_USERNAME/cafe-ordering-system.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 2: Deploy to Vercel (Recommended - FREE)

### Option A: Deploy via Vercel Dashboard
1. Go to https://vercel.com/
2. Sign up/login with your GitHub account
3. Click **"Add New" → "Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

6. **Add Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://mohdshayan0010_db_user:87976757@shayan.pbatlzj.mongodb.net/?appName=Shayan
   SESSION_SECRET=your-super-secret-key-here-change-this-in-production
   STAFF_USERNAME=testervip
   STAFF_PASSWORD=checkkro
   ```
   
7. Click **"Deploy"**

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
cd "F:\cafe website\cafe-app"
vercel
```
Follow prompts, then add environment variables in Vercel dashboard.

---

## 🌐 Step 3: Connect Your Domain

### In Vercel Dashboard
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `mycafe.com`)
3. Follow DNS configuration instructions:
   - **For Apex Domain** (mycafe.com):
     - Type: `A`
     - Name: `@`
     - Value: `76.76.19.19`
   - **For WWW Subdomain** (www.mycafe.com):
     - Type: `CNAME`
     - Name: `www`
     - Value: `cname.vercel-dns.com`

### Update DNS at Your Domain Provider
1. Login to your domain registrar (where you bought the domain)
2. Go to DNS settings
3. Add the records shown above
4. Wait 5-60 minutes for DNS propagation

---

## 🔒 Security Checklist Before Going Live

1. **Change SESSION_SECRET** in Vercel environment variables to a strong random string:
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **MongoDB Security**:
   - In MongoDB Atlas, go to **Network Access**
   - Add Vercel's IP ranges OR use `0.0.0.0/0` (allow all) for serverless

3. **Staff Credentials**:
   - Consider moving staff login to database instead of env vars
   - Or change `STAFF_PASSWORD` to something secure

---

## 📱 Test Your Live Site

After deployment:
1. Visit your Vercel URL (e.g., `cafe-app.vercel.app`)
2. Test customer flow:
   - Signup → Browse menu → Place order → View QR
3. Test staff flow:
   - Login (testervip/checkkro) → View orders → Update status → Toggle menu

---

## 🎉 You're Live!

Your cafe ordering system is now:
- ✅ Running on Vercel's global CDN
- ✅ Accessible at your custom domain
- ✅ Connected to MongoDB Atlas
- ✅ Ready for customers and staff

---

## 🔄 Future Updates

To update your live site:
```bash
cd "F:\cafe website\cafe-app"
# Make your changes
git add .
git commit -m "Update: description of changes"
git push
```
Vercel will automatically redeploy!

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set correctly in Vercel
- Verify MongoDB URI is accessible

### Can't Connect to Database
- Add `0.0.0.0/0` to MongoDB Atlas Network Access
- Check connection string in environment variables

### Domain Not Working
- Wait 30-60 minutes for DNS propagation
- Verify DNS records with: https://dnschecker.org

### QR Scanner Not Working
- QR scanner requires HTTPS (works automatically on Vercel)
- Grant camera permissions in browser

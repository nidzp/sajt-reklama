# Domain Setup - InfinityFree + Vercel

## 📋 Account Details

- **InfinityFree Account**: if0_40249576
- **InfinityFree Dashboard**: https://dash.infinityfree.com/accounts/if0_40249576
- **Vercel Project Token**: prj_8G4qihPWDBfPqtFI27aSFVkUEsFm
- **Default InfinityFree Domain**: https://if0-40249576.infinityfreeapp.com

---

## 🔧 Step 1: Vercel Custom Domain Setup

### Option A: Connect Custom Domain from Vercel Dashboard

1. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com/nidzps-projects/sajt-reklama/settings/domains
2. **Add Custom Domain**:

   - Click "Add Domain"
   - Enter your domain (e.g., `nidzpdesing.com` or InfinityFree subdomain)
   - Click "Add"

3. **Get DNS Records**:
   - Vercel will provide DNS records (A record or CNAME)
   - Copy these values for next step

### Option B: Use Vercel CLI

```bash
# Add domain via CLI
vercel domains add nidzpdesing.com --project=sajt-reklama

# Or add InfinityFree subdomain
vercel domains add if0-40249576.infinityfreeapp.com --project=sajt-reklama
```

---

## 🌐 Step 2: Configure DNS on InfinityFree

1. **Login to InfinityFree**:

   - Go to: https://dash.infinityfree.com/accounts/if0_40249576

2. **Access DNS Management**:

   - Click on your account `if0_40249576`
   - Go to "DNS Records" or "Domain Settings"

3. **Add DNS Records from Vercel**:

   **For A Record** (if Vercel provides):

   ```
   Type: A
   Name: @ (or subdomain like www)
   Value: 76.76.21.21 (Vercel's IP - check Vercel dashboard for exact IP)
   TTL: 3600
   ```

   **For CNAME Record** (recommended):

   ```
   Type: CNAME
   Name: www (or your subdomain)
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

4. **Add Root Domain** (if using apex domain):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

---

## 🔐 Step 3: SSL Certificate Setup

Vercel automatically provisions SSL certificates via Let's Encrypt once DNS is configured.

**Wait Time**: 24-48 hours for DNS propagation

**Check SSL Status**:

```bash
# Verify SSL
curl -I https://your-domain.com
```

---

## ✅ Step 4: Update Environment Variables

Already configured in `.env`:

```properties
ALLOWED_ORIGINS=http://localhost:3000,https://sajt-reklama.vercel.app,https://if0-40249576.infinityfreeapp.com
VERCEL_PROJECT_TOKEN=prj_8G4qihPWDBfPqtFI27aSFVkUEsFm
```

**Add to Vercel Dashboard**:

1. Go to: https://vercel.com/nidzps-projects/sajt-reklama/settings/environment-variables
2. Add:
   - `GROQ_API_KEY` = `<your-groq-api-key>` (from .env file)
   - `AI_MODEL` = `llama-3.1-8b-instant`
   - `CHATBOT_ENABLED` = `true`
   - `ALLOWED_ORIGINS` = `http://localhost:3000,https://sajt-reklama.vercel.app,https://if0-40249576.infinityfreeapp.com`

---

## 🚀 Step 5: Deploy and Test

```bash
# Deploy to Vercel
git add -A
git commit -m "feat: add InfinityFree domain support and CORS configuration"
git push origin main

# Deploy to production
vercel --prod
```

**Test the deployment**:

```bash
# Check if site is live on Vercel
curl https://sajt-reklama.vercel.app

# Check if DNS is resolving (after DNS propagation)
nslookup your-domain.com

# Test CORS
curl -H "Origin: https://if0-40249576.infinityfreeapp.com" -I https://sajt-reklama.vercel.app/api/health
```

---

## 📊 Verification Checklist

- [ ] Domain added in Vercel Dashboard
- [ ] DNS records configured on InfinityFree
- [ ] SSL certificate provisioned (check Vercel dashboard)
- [ ] Environment variables set in Vercel
- [ ] CORS updated in `.env` and `server.js`
- [ ] Git changes committed and pushed
- [ ] Site deployed to production
- [ ] Custom domain accessible (after DNS propagation)
- [ ] AI Chatbot works on custom domain
- [ ] All pages load correctly

---

## 🔍 Troubleshooting

### DNS Not Resolving

```bash
# Check DNS propagation
nslookup your-domain.com 8.8.8.8

# Check DNS records
dig your-domain.com
```

### SSL Certificate Not Provisioning

- Wait 24-48 hours for DNS propagation
- Ensure CNAME/A records point to Vercel
- Check Vercel dashboard for SSL status
- Try removing and re-adding domain in Vercel

### CORS Errors

- Verify `ALLOWED_ORIGINS` includes your domain
- Check browser console for exact origin
- Update `server.js` CORS configuration if needed
- Redeploy after changes

### 404 Errors

- Check Vercel deployment logs
- Verify `vercel.json` rewrites configuration
- Ensure all files are in `/public/` directory

---

## 📝 Quick Commands

```bash
# Check Vercel deployment status
vercel ls

# View deployment logs
vercel logs

# Check domain status
vercel domains ls

# Remove domain (if needed)
vercel domains rm your-domain.com

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

## 🎯 Expected Result

After DNS propagation (24-48 hours):

- ✅ Site accessible at: `https://your-domain.com`
- ✅ SSL certificate active (HTTPS)
- ✅ AI Chatbot functional
- ✅ All pages load correctly
- ✅ CORS configured for InfinityFree domain

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs/concepts/projects/custom-domains
- **InfinityFree Support**: https://forum.infinityfree.com/
- **DNS Propagation Check**: https://dnschecker.org/
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/

---

## 🔑 Credentials Summary

```properties
# InfinityFree
Account ID: if0_40249576
Dashboard: https://dash.infinityfree.com/accounts/if0_40249576
Default Domain: https://if0-40249576.infinityfreeapp.com

# Vercel
Project Token: prj_8G4qihPWDBfPqtFI27aSFVkUEsFm
Project URL: https://vercel.com/nidzps-projects/sajt-reklama
Production URL: https://sajt-reklama.vercel.app

# Groq AI (stored in .env - DO NOT COMMIT)
API Key: <stored-in-env-file>
Model: llama-3.1-8b-instant
```

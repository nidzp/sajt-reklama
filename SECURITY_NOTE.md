# Security Note

## Groq API Key Exposure

A Groq API key was accidentally committed to the repository in `SETUP_GUIDE.md`.

**Note**: The specific key has been removed from this documentation for security reasons. If you need to rotate your key, visit https://console.groq.com/keys

### Actions Taken:

1. ✅ Removed hardcoded API key from `SETUP_GUIDE.md` (commit: 8cf2f6f)
2. ✅ Replaced with placeholder: `your_groq_api_key_here`
3. ✅ Added note to get free key at https://console.groq.com/

### Required Actions:

⚠️ **URGENT**: The exposed API key must be rotated immediately:

1. Go to https://console.groq.com/keys
2. Delete the old/exposed key if it exists
3. Create a new API key
4. Update `.env` file with new key
5. Update Vercel environment variables:
   - Go to https://vercel.com/nidzps-projects/nidzp/settings/environment-variables
   - Update `GROQ_API_KEY` with new value
   - Redeploy: `vercel --prod`

### GitHub Push Protection:

GitHub is blocking the push because the secret still exists in commit history. Options:

**Option A**: Allow the secret (temporary, until key is rotated)
- Visit: https://github.com/nidzp/sajt-reklama/security/secret-scanning/unblock-secret/34XVnSAs7u9S6ajLJpbeFYF3yfO
- Click "Allow secret"
- **Then immediately rotate the API key!**

**Option B**: Rewrite commit history (removes secret permanently)
```bash
# Interactive rebase to remove secret from all commits
git rebase -i HEAD~10

# For each commit with the secret, mark as 'edit'
# Then amend the commit to remove the secret
git commit --amend
git rebase --continue

# Force push (WARNING: rewrites history)
git push --force origin main
```

**Option C**: Use BFG Repo-Cleaner (automated history rewrite)
```bash
# Install BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Replace secret in all commits
bfg --replace-text passwords.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force origin main
```

### Prevention:

✅ **Already implemented**:
- `.env.example` with placeholder values
- `.gitignore` includes `.env`
- Documentation uses placeholders

🔒 **Recommended**:
- Enable GitHub Secret Scanning: https://github.com/nidzp/sajt-reklama/settings/security_analysis
- Use environment variables for all secrets
- Never commit `.env` files
- Review commits before pushing

---

**Status**: Waiting for user to rotate API key and allow push  
**Priority**: HIGH - API key is exposed  
**Created**: 2024-01-25

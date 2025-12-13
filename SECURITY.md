# Security Notice ⚠️

## Important: Protect Your API Keys

This repository contains example environment files (`.env.example`) that show the required configuration format. **Never commit actual `.env` files with real API keys to version control.**

### Before Pushing to GitHub

1. **Check your `.env` files are in `.gitignore`**:
   ```bash
   cat .gitignore | grep ".env"
   ```

2. **Remove any committed secrets** (if you accidentally committed them):
   ```bash
   # Remove the file from git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (WARNING: This rewrites history)
   git push origin --force --all
   ```

3. **Regenerate compromised API keys**:
   - If you accidentally committed your Gemini API key, revoke it at [Google AI Studio](https://aistudio.google.com/)
   - Generate a new API key
   - Update your local `.env` file

### Best Practices

- ✅ Use `.env.example` files to document required variables
- ✅ Keep actual `.env` files in `.gitignore`
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys regularly
- ❌ Never commit API keys, passwords, or tokens
- ❌ Never share `.env` files publicly

### Checking for Exposed Secrets

Before pushing, verify no secrets are staged:
```bash
git diff --cached | grep -i "api_key\|password\|secret"
```

If you find any secrets, unstage the file:
```bash
git reset HEAD backend/.env
```

---

**If you discover a security vulnerability, please report it privately via GitHub Security Advisories.**

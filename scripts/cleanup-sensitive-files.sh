#!/bin/bash

# Security Cleanup Script
# Removes sensitive files from Git repository
# Run this AFTER changing your SMTP password

echo "🚨 SECURITY CLEANUP SCRIPT"
echo "================================"
echo ""
echo "⚠️  WARNING: This will remove sensitive files from Git"
echo "⚠️  Make sure you have:"
echo "    1. Changed your SMTP password in Hostinger"
echo "    2. Updated the password in Supabase"
echo ""
read -p "Have you changed your SMTP password? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Please change your SMTP password first!"
    echo "   1. Go to https://hpanel.hostinger.com"
    echo "   2. Emails → Email Accounts → nex@nexconsultingltd.com"
    echo "   3. Manage → Change Password"
    exit 1
fi

echo ""
echo "📝 Step 1: Removing sensitive files from Git..."

# Remove files from Git (but keep local copies)
git rm --cached EMAIL_TEST_RESULTS.md 2>/dev/null || echo "  - EMAIL_TEST_RESULTS.md already removed"
git rm --cached SUPABASE_EMAIL_SETUP.md 2>/dev/null || echo "  - SUPABASE_EMAIL_SETUP.md already removed"
git rm --cached EMAIL_AUDIT_REPORT.md 2>/dev/null || echo "  - EMAIL_AUDIT_REPORT.md already removed"
git rm --cached EMAIL_AUDIT_SUMMARY.txt 2>/dev/null || echo "  - EMAIL_AUDIT_SUMMARY.txt already removed"
git rm --cached scripts/test-smtp-config.js 2>/dev/null || echo "  - test-smtp-config.js already removed"
git rm --cached SECURITY_INCIDENT_RESPONSE.md 2>/dev/null || echo "  - SECURITY_INCIDENT_RESPONSE.md removed"

echo "✅ Files removed from Git tracking"
echo ""

echo "📝 Step 2: Committing changes..."
git add .gitignore
git commit -m "security: remove files with exposed SMTP credentials and update .gitignore

- Remove EMAIL_TEST_RESULTS.md (contained SMTP config)
- Remove SUPABASE_EMAIL_SETUP.md (contained credentials)
- Remove EMAIL_AUDIT_REPORT.md (contained sensitive info)
- Remove scripts/test-smtp-config.js (contained credentials)
- Update .gitignore to prevent future credential leaks

SMTP password has been rotated.
Ref: GitGuardian security alert"

echo "✅ Changes committed"
echo ""

echo "📝 Step 3: Pushing to GitHub..."
echo "⚠️  This will update the main branch"
read -p "Push to GitHub now? (yes/no): " push_confirm

if [ "$push_confirm" == "yes" ]; then
    git push origin main
    echo "✅ Pushed to GitHub"
else
    echo "⚠️  Skipped push. Run 'git push origin main' when ready"
fi

echo ""
echo "================================"
echo "✅ CLEANUP COMPLETE"
echo ""
echo "⚠️  IMPORTANT: Git history still contains old credentials"
echo "   To completely remove from history, run:"
echo "   ./scripts/cleanup-git-history.sh"
echo ""
echo "📝 Next steps:"
echo "   1. Verify files removed on GitHub"
echo "   2. Test email delivery in Supabase"
echo "   3. Monitor GitGuardian for new alerts"
echo "   4. (Optional) Clean Git history to remove old credentials"
echo ""

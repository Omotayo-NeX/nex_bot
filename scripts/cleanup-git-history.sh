#!/bin/bash

# Git History Cleanup Script
# Removes sensitive files from entire Git history
# ⚠️  WARNING: This rewrites Git history - use with caution

echo "🚨 GIT HISTORY CLEANUP"
echo "================================"
echo ""
echo "⚠️  WARNING: This will rewrite Git history"
echo "⚠️  This is IRREVERSIBLE"
echo ""
echo "Prerequisites:"
echo "  1. SMTP password already changed"
echo "  2. Files already removed from current commit"
echo "  3. All team members notified"
echo "  4. Backup of repository created"
echo ""
read -p "Do you want to continue? (type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "📝 Step 1: Creating backup..."
BACKUP_DIR="../nex_bot_backup_$(date +%Y%m%d_%H%M%S)"
cp -r . "$BACKUP_DIR"
echo "✅ Backup created: $BACKUP_DIR"

echo ""
echo "📝 Step 2: Checking for BFG Repo-Cleaner..."
if ! command -v bfg &> /dev/null; then
    echo "❌ BFG not found"
    echo ""
    echo "Install BFG:"
    echo "  macOS: brew install bfg"
    echo "  Or download from: https://rtyley.github.io/bfg-repo-cleaner/"
    echo ""
    exit 1
fi

echo "✅ BFG found"

echo ""
echo "📝 Step 3: Creating file list to remove..."
cat > /tmp/files-to-remove.txt <<EOF
EMAIL_TEST_RESULTS.md
SUPABASE_EMAIL_SETUP.md
EMAIL_AUDIT_REPORT.md
EMAIL_AUDIT_SUMMARY.txt
test-smtp-config.js
EOF

echo "✅ File list created"

echo ""
echo "📝 Step 4: Removing files from history..."
echo "   This may take a few minutes..."

# Remove each file from history
while IFS= read -r file; do
    echo "   Removing: $file"
    bfg --delete-files "$file" --no-blob-protection .
done < /tmp/files-to-remove.txt

echo "✅ Files removed from history"

echo ""
echo "📝 Step 5: Cleaning up repository..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive
echo "✅ Repository cleaned"

echo ""
echo "📝 Step 6: Force pushing to GitHub..."
echo "⚠️  This will overwrite GitHub history"
read -p "Force push now? (type 'YES' to confirm): " push_confirm

if [ "$push_confirm" == "YES" ]; then
    git push origin --force --all
    git push origin --force --tags
    echo "✅ Pushed to GitHub"
else
    echo "⚠️  Skipped push. Run manually:"
    echo "   git push origin --force --all"
    echo "   git push origin --force --tags"
fi

echo ""
echo "================================"
echo "✅ HISTORY CLEANUP COMPLETE"
echo ""
echo "📝 What was done:"
echo "   - Backup created at: $BACKUP_DIR"
echo "   - Sensitive files removed from all commits"
echo "   - Repository cleaned and compressed"
echo "   - History rewritten and pushed to GitHub"
echo ""
echo "📝 Next steps:"
echo "   1. Verify files removed from GitHub"
echo "   2. Check GitGuardian - alert should clear"
echo "   3. Notify team to re-clone repository:"
echo "      cd .."
echo "      rm -rf nex_bot"
echo "      git clone https://github.com/Omotayo-NeX/nex_bot.git"
echo ""

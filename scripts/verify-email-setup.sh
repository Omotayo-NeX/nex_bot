#!/bin/bash

# Email Setup Verification Script for NeX AI
# Tests DNS records and email configuration

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         NeX AI EMAIL SETUP VERIFICATION                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Domain: nexconsultingltd.com"
echo "Date: $(date)"
echo ""
echo "─────────────────────────────────────────────────────────────────"

# Initialize counters
PASSED=0
FAILED=0
WARNINGS=0

# Test SPF Record
echo ""
echo "🔍 TEST 1: SPF Record"
echo "─────────────────────────────────────────────────────────────────"
SPF=$(dig +short txt nexconsultingltd.com | grep "v=spf1")
if [ -n "$SPF" ]; then
    echo "✅ PASS: SPF record found"
    echo "   $SPF"
    ((PASSED++))
else
    echo "❌ FAIL: SPF record not found"
    ((FAILED++))
fi

# Test MX Records
echo ""
echo "🔍 TEST 2: MX Records"
echo "─────────────────────────────────────────────────────────────────"
MX=$(dig +short mx nexconsultingltd.com)
if [ -n "$MX" ]; then
    echo "✅ PASS: MX records found"
    echo "$MX" | sed 's/^/   /'
    ((PASSED++))
else
    echo "❌ FAIL: MX records not found"
    ((FAILED++))
fi

# Test DMARC Record
echo ""
echo "🔍 TEST 3: DMARC Record"
echo "─────────────────────────────────────────────────────────────────"
DMARC=$(dig +short txt _dmarc.nexconsultingltd.com | grep "v=DMARC1")
if [ -n "$DMARC" ]; then
    echo "✅ PASS: DMARC record found"
    echo "   $DMARC"

    # Check if upgraded policy
    if echo "$DMARC" | grep -q "p=quarantine\|p=reject"; then
        echo "   ✨ BONUS: Strong policy configured!"
    elif echo "$DMARC" | grep -q "rua="; then
        echo "   ⚠️  Note: Policy is 'none' but reporting configured"
        ((WARNINGS++))
    else
        echo "   ⚠️  Warning: Basic configuration (consider upgrading)"
        ((WARNINGS++))
    fi
    ((PASSED++))
else
    echo "❌ FAIL: DMARC record not found"
    ((FAILED++))
fi

# Test DKIM Record
echo ""
echo "🔍 TEST 4: DKIM Record"
echo "─────────────────────────────────────────────────────────────────"
DKIM_FOUND=0
for selector in default hostinger mail s1 k1; do
    DKIM=$(dig +short txt ${selector}._domainkey.nexconsultingltd.com 2>/dev/null | grep "v=DKIM1")
    if [ -n "$DKIM" ]; then
        echo "✅ PASS: DKIM record found (selector: $selector)"
        echo "   ${DKIM:0:60}..."
        DKIM_FOUND=1
        ((PASSED++))
        break
    fi
done

if [ $DKIM_FOUND -eq 0 ]; then
    echo "❌ CRITICAL: DKIM record not found"
    echo "   Checked selectors: default, hostinger, mail, s1, k1"
    echo "   ⚠️  Without DKIM, emails may go to spam!"
    ((FAILED++))
fi

# Test SMTP Connection
echo ""
echo "🔍 TEST 5: SMTP Connection"
echo "─────────────────────────────────────────────────────────────────"
if command -v nc >/dev/null 2>&1; then
    if timeout 5 nc -zv smtp.hostinger.com 587 2>&1 | grep -q "succeeded\|open"; then
        echo "✅ PASS: SMTP port 587 is accessible"
        ((PASSED++))
    else
        echo "⚠️  Warning: Cannot verify SMTP connection (firewall/network)"
        ((WARNINGS++))
    fi
else
    echo "⚠️  SKIP: nc (netcat) not available to test SMTP"
    ((WARNINGS++))
fi

# Test Production URL
echo ""
echo "🔍 TEST 6: Production URL Accessibility"
echo "─────────────────────────────────────────────────────────────────"
if curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ai.nexconsultingltd.com 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ PASS: Production site is accessible"
    echo "   URL: https://ai.nexconsultingltd.com"
    ((PASSED++))
else
    echo "⚠️  Warning: Cannot reach production URL"
    ((WARNINGS++))
fi

# Test Admin Login Page
echo ""
echo "🔍 TEST 7: Admin Login Page"
echo "─────────────────────────────────────────────────────────────────"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://ai.nexconsultingltd.com/admin/login 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ PASS: Admin login page is accessible"
    echo "   URL: https://ai.nexconsultingltd.com/admin/login"
    ((PASSED++))
else
    echo "⚠️  Warning: Admin login returned HTTP $HTTP_CODE"
    ((WARNINGS++))
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Passed:   $PASSED"
echo "❌ Failed:   $FAILED"
echo "⚠️  Warnings: $WARNINGS"
echo ""

# Calculate score
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SCORE=$((PASSED * 100 / TOTAL))
    echo "Overall Score: $SCORE/100"
    echo ""

    if [ $SCORE -ge 85 ]; then
        echo "🎉 EXCELLENT! Your email setup is properly configured."
        EXIT_CODE=0
    elif [ $SCORE -ge 70 ]; then
        echo "✅ GOOD! Minor improvements recommended."
        EXIT_CODE=0
    elif [ $SCORE -ge 50 ]; then
        echo "⚠️  FAIR: Several issues need attention."
        EXIT_CODE=1
    else
        echo "❌ POOR: Critical issues require immediate attention."
        EXIT_CODE=1
    fi
fi

echo ""
echo "─────────────────────────────────────────────────────────────────"
echo "📋 NEXT STEPS:"
echo ""

if [ $FAILED -gt 0 ]; then
    echo "1. Review failed tests above"
    echo "2. Check SUPABASE_EMAIL_SETUP.md for fixes"
    if [ $DKIM_FOUND -eq 0 ]; then
        echo "3. ⚠️  CRITICAL: Add DKIM record in Hostinger"
    fi
    echo "4. Verify Supabase SMTP configuration"
fi

echo ""
echo "📞 Resources:"
echo "   - Setup Guide: SUPABASE_EMAIL_SETUP.md"
echo "   - Full Report: EMAIL_AUDIT_REPORT.md"
echo "   - Test Email: node scripts/test-smtp-config.js"
echo ""
echo "─────────────────────────────────────────────────────────────────"

exit $EXIT_CODE

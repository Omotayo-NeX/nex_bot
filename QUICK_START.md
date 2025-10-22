# 🚀 Quick Start - Admin Dashboard

## 🔗 Login to Your Dashboard

**URL**: https://ai.nexconsultingltd.com/admin/login

**Email**: adetolaodunubi@gmail.com

---

## ⚙️ Required Setup (Do This First!)

### 1. Update Supabase
Go to: https://app.supabase.com → Authentication → URL Configuration

**Site URL:**
```
https://ai.nexconsultingltd.com
```

**Redirect URLs (add all 3):**
```
https://ai.nexconsultingltd.com/admin/login
https://ai.nexconsultingltd.com/dashboard/subscriptions
https://ai.nexconsultingltd.com/auth/callback
```

### 2. Update Paystack
Go to: https://dashboard.paystack.com → Settings → Webhooks

**Webhook URL:**
```
https://ai.nexconsultingltd.com/api/paystack/webhook
```

---

## ✅ That's It!

After updating Supabase and Paystack:

1. Go to: **https://ai.nexconsultingltd.com/admin/login**
2. Enter: **adetolaodunubi@gmail.com**
3. Check email for magic link
4. Click link → Dashboard opens!

---

📄 **Full Documentation**: See `PRODUCTION_SETUP.md`

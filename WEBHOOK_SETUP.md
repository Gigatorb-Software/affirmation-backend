# Stripe Webhook Setup and Debugging Guide

## 🔍 **Current Issue Analysis**

Based on your session data:

```json
{
  "payment_status": "unpaid",
  "subscription": null,
  "customer": null
}
```

This indicates the payment was **not completed successfully**.

## 🛠️ **Debugging Steps**

### **Step 1: Check Webhook Endpoint**

1. **Verify your webhook endpoint is accessible:**

   ```
   https://your-domain.com/api/subscription/webhook
   ```

2. **For local development, use Stripe CLI:**

   ```bash
   # Install Stripe CLI
   npm install -g stripe-cli

   # Login to Stripe
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:8000/api/subscription/webhook
   ```

### **Step 2: Check Webhook Configuration**

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Verify your webhook endpoint URL**
3. **Check selected events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### **Step 3: Test Payment Flow**

1. **Use the correct test card:**

   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/25
   CVC: 123
   ```

2. **Complete the payment process**
3. **Check backend logs for webhook events**

### **Step 4: Manual Webhook Testing**

Use the new test endpoint to manually trigger webhook processing:

```bash
curl -X POST http://localhost:8000/api/subscription/test-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"session_id": "cs_test_your_session_id"}'
```

## 🔧 **Environment Variables**

Make sure these are set in your `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
```

## 📊 **Expected Flow**

### **Successful Payment:**

1. User completes payment with test card
2. Stripe sends `checkout.session.completed` webhook
3. Backend processes webhook and updates database
4. User sees success page with verified subscription

### **Current Issue:**

1. Payment not completing (status: "unpaid")
2. No webhook events being sent
3. Database not updated

## 🚨 **Common Issues**

### **Issue 1: Webhook Not Receiving Events**

- **Cause:** Endpoint not publicly accessible
- **Solution:** Use Stripe CLI for local development

### **Issue 2: Payment Not Completing**

- **Cause:** Wrong test card or incomplete payment
- **Solution:** Use `4242 4242 4242 4242` and complete payment

### **Issue 3: Webhook Secret Mismatch**

- **Cause:** Wrong webhook secret in environment
- **Solution:** Copy correct secret from Stripe dashboard

### **Issue 4: Database Connection Issues**

- **Cause:** Prisma connection problems
- **Solution:** Check database connection and run migrations

## 🔍 **Debugging Commands**

### **Check Webhook Events:**

```bash
# View webhook events in Stripe CLI
stripe events list --limit 10
```

### **Test Webhook Locally:**

```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:8000/api/subscription/webhook
```

### **Check Database:**

```bash
# Run Prisma migrations
npm run prisma:migrate

# Check database connection
npm run prisma:generate
```

## 📝 **Log Analysis**

Look for these log messages in your backend:

### **✅ Successful Flow:**

```
🔔 Webhook received: { signature: 'Present', endpointSecret: 'Set' }
✅ Webhook signature verified
📦 Webhook event type: checkout.session.completed
💳 Checkout session completed: { paymentStatus: 'paid', subscription: 'sub_...' }
🔄 Processing subscription payment...
✅ Subscription payment processed successfully
```

### **❌ Failed Flow:**

```
❌ Webhook signature verification failed
❌ Error in handlePaymentSuccess
❌ Payment verification failed
```

## 🎯 **Next Steps**

1. **Set up Stripe CLI for local development**
2. **Test with correct test card**
3. **Monitor backend logs during payment**
4. **Use manual test endpoint if needed**
5. **Check webhook events in Stripe dashboard**

## 📞 **Support**

If issues persist:

1. Check Stripe dashboard for failed payments
2. Review backend logs for errors
3. Verify webhook endpoint accessibility
4. Test with Stripe CLI webhook forwarding

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
  try {
    console.log('Testing Stripe connection...');
    
    // Test 1: Check if we can retrieve account information
    const account = await stripe.accounts.retrieve();
    console.log('✅ Stripe connection successful');
    console.log('Account ID:', account.id);
    
    // Test 2: List products to verify setup
    const products = await stripe.products.list({ limit: 10 });
    console.log('\n📦 Available products:');
    products.data.forEach(product => {
      console.log(`- ${product.name} (${product.id})`);
    });
    
    // Test 3: List prices to verify pricing setup
    const prices = await stripe.prices.list({ limit: 10 });
    console.log('\n💰 Available prices:');
    prices.data.forEach(price => {
      console.log(`- ${price.unit_amount / 100} ${price.currency} / ${price.recurring?.interval} (${price.id})`);
    });
    
    // Test 4: Check environment variables
    console.log('\n🔧 Environment variables:');
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
    console.log('STRIPE_MONTHLY_PRICE_ID:', process.env.STRIPE_MONTHLY_PRICE_ID ? '✅ Set' : '❌ Missing');
    console.log('STRIPE_YEARLY_PRICE_ID:', process.env.STRIPE_YEARLY_PRICE_ID ? '✅ Set' : '❌ Missing');
    console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL ? '✅ Set' : '❌ Missing');
    
    console.log('\n🎉 Stripe integration test completed successfully!');
    
  } catch (error) {
    console.error('❌ Stripe test failed:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Set up your .env file with Stripe credentials');
    console.log('2. Created products and prices in your Stripe dashboard');
    console.log('3. Used the correct test/live keys');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  testStripeConnection();
}

module.exports = { testStripeConnection }; 
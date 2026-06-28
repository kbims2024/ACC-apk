async function run() {
  try {
    // 1. Register a fake user
    let res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Test User",
            email: "test_stripe_xxx@example.com",
            phone: "+225000000",
            password: "password123",
            role: "worker"
        })
    });
    let data = await res.json();
    console.log("Register:", res.status, data);

    const token = data.token;
    if (!token) {
       console.log("No token, existing user?");
       // login
       res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: "test_stripe_xxx@example.com", password: "password123" })
       });
       data = await res.json();
       console.log("Login:", res.status, data);
    }
    
    const authToken = data.token;

    // 2. call stripe checkout
    const req = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}`, 'Origin': 'https://my-test-app.com' },
       body: JSON.stringify({ plan: 'pro', duration: 'semiannual' })
     });
     const checkoutData = await req.json();
     console.log("Checkout:", req.status, checkoutData);

  } catch(e) {
     console.error(e);
  }
}
run();

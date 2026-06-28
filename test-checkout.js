async function run() {
  const token = process.env.TEST_TOKEN || "";
  try {
     const req = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
       body: JSON.stringify({ plan: 'pro', duration: 'monthly' })
     });
     const data = await req.text();
     console.log(req.status, data);
  } catch(e) {
     console.error(e);
  }
}
run();

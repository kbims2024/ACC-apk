async function run() {
  const req = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'https://my-test-app.com' },
    body: JSON.stringify({ plan: 'pro', duration: 'monthly' })
  });
  console.log(req.status, await req.text());
}
run();

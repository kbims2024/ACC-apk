fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'test',
    email: 'test@example.com',
    password: 'password',
    phone: '+225 0102030405',
    role: 'worker'
  })
})
.then(res => res.text().then(text => console.log('STATUS:', res.status, 'BODY:', text)))
.catch(console.error);

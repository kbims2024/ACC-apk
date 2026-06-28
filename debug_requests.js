
fetch('http://127.0.0.1:3000/api/requests')
  .then(res => res.status)
  .then(status => console.log("Status GET /api/requests:", status))
  .catch(err => console.error(err));

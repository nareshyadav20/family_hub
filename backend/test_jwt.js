const axios = require('axios');
const jwt = require('jsonwebtoken');
async function testLoginAndDecode() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'panganareshyadav24@gmail.com',
      password: 'password123'
    });
    const token = res.data.token;
    console.log("Token received.");
    const decoded = jwt.decode(token);
    console.log("Decoded Token Payload:", decoded);
  } catch(e) {
    console.log("Error:", e.response ? e.response.data : e.message);
  }
}
testLoginAndDecode();

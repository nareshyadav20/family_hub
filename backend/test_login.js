const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'panganareshyadav24@gmail.com',
      password: 'password123'
    });
    console.log("LOGIN SUCCESS", res.data.success);
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
testLogin();

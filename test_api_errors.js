const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'https://club-api-project.vercel.app';

async function testUpload() {
  console.log("\\n--- Testing /api/upload ---");
  try {
    const filePath = path.join(__dirname, 'dummy.png');
    // Create a 1x1 transparent PNG
    const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');
    fs.writeFileSync(filePath, pngBuffer);

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), { contentType: 'image/png' });

    const response = await axios.post(`${BASE_URL}/api/upload`, form, {
      headers: { ...form.getHeaders() }
    });

    console.log("Upload Success:", response.data);
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error.response) {
      console.error("Upload failed with status:", error.response.status);
      console.error("Upload Response data:", error.response.data);
    } else {
      console.error("Upload Request failed:", error.message);
    }

    if (fs.existsSync(path.join(__dirname, 'dummy.png'))) {
      fs.unlinkSync(path.join(__dirname, 'dummy.png'));
    }
  }
}

async function testStripeStatus() {
  console.log("\\n--- Testing /api/stripe/status ---");
  try {
    const response = await axios.get(`${BASE_URL}/api/stripe/status?user_id=112`);
    console.log("Stripe Success:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("Stripe failed with status:", error.response.status);
      console.error("Stripe Response data:", error.response.data);
    } else {
      console.error("Stripe Request failed:", error.message);
    }
  }
}

async function runTests() {
  await testUpload();
  await testStripeStatus();
}

runTests();

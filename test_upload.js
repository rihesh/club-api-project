const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
  try {
    const filePath = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(filePath, 'Hello world');

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    console.log("Sending upload request to Vercel...");
    const response = await axios.post('https://club-api-project-git-fresh-start-riheshs-projects.vercel.app/api/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log("Success:", response.data);
    fs.unlinkSync(filePath);
  } catch (error) {
    if (error.response) {
      console.error("Upload failed with status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else {
      console.error("Request failed:", error.message);
    }
  }
}

testUpload();

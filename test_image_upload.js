const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
  try {
    const filePath = path.join(__dirname, 'dummy.png');
    // Create a 1x1 transparent PNG
    const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082', 'hex');
    fs.writeFileSync(filePath, pngBuffer);

    const form = new FormData();
    // Explicitly set the content type to avoid form-data guessing wrong
    form.append('file', fs.createReadStream(filePath), { contentType: 'image/png' });

    console.log("Sending PNG upload request to Vercel...");
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
    if (fs.existsSync(path.join(__dirname, 'dummy.png'))) {
        fs.unlinkSync(path.join(__dirname, 'dummy.png'));
    }
  }
}

testUpload();

// replace-design-image.js
const fs = require('fs');
const path = require('path');

// 🔹 Change this to the current image filename you used for your website design
const oldImage = 'background.png'; 
const newImage = 'background.png';  // the image you want to use instead
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  });
}

function replaceImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!extensions.includes(ext)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldImage)) {
    // escape special regex characters in filename
    const regex = new RegExp(oldImage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    content = content.replace(regex, newImage);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated image in: ${filePath}`);
  }
}

// Start scanning from current directory
walkDir(process.cwd(), replaceImage);

console.log(`🎉 All references to ${oldImage} replaced with ${newImage}`);
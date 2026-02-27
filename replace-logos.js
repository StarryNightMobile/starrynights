// replace-logos.js
const fs = require('fs');
const path = require('path');

const targetLogo = "logo.png"; // the file you want to use
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.css']; // file types to scan

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

function replaceLogos(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!extensions.includes(ext)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  const regex = /([\'\"\(]([^\'\"\(\)]*logo[^\'\"\(\)]*\.(png|jpg|jpeg|svg))[\'\"\)])/gi;

  if (regex.test(content)) {
    content = content.replace(regex, `"${targetLogo}"`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated logo in: ${filePath}`);
  }
}

// Start scanning from current directory
walkDir(process.cwd(), replaceLogos);

console.log("logo.png");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = 'C:\\Users\\Arpit\\Desktop\\netflix-clone-files';
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

const srcDir = 'C:\\Users\\Arpit\\OneDrive\\PB\\Pratz Birthday Website\\netflix-clone';

try {
  execSync(`robocopy "${srcDir}" "${targetDir}" /E /XD node_modules .next .git`, { stdio: 'ignore' });
} catch (e) {
  // robocopy exits with code 1 on success
}

console.log('Done! Ready at: ' + targetDir);

const fs = require('fs');

const files = [
  'src/app/admin/dashboard/page.js',
  'src/app/admin/reports/page.js',
  'src/app/admin/users/page.js'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Find the async function
  const funcMatch = content.match(/async\s+function\s+(fetch[A-Za-z0-9_]+)\s*\(\)\s*\{([\s\S]*?)^\s*\};/m);
  
  if (funcMatch) {
    // Remove the function from its current location
    content = content.replace(funcMatch[0], '');
    
    // Find the useEffect block
    const useEffMatch = content.match(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[\]\);/m);
    
    if (useEffMatch) {
      // Place the function right above the useEffect block
      content = content.replace(useEffMatch[0], funcMatch[0].replace('};', '}') + '\n\n  ' + useEffMatch[0]);
    }
  }
  
  fs.writeFileSync(f, content);
});

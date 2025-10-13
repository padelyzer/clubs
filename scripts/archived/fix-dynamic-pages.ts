import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

async function fixDynamicPages() {
  const appDir = path.join(process.cwd(), 'app');
  
  // Find all page.tsx files that use authentication
  const pageFiles = await glob('**/page.tsx', { cwd: appDir });
  
  const authPatterns = ['requireAuth', 'getSession', 'requireSuperAdmin'];
  const dynamicExport = "export const dynamic = 'force-dynamic'";
  
  let fixedFiles = 0;
  
  for (const file of pageFiles) {
    const filePath = path.join(appDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if file uses authentication
    const usesAuth = authPatterns.some(pattern => content.includes(pattern));
    
    // Skip if doesn't use auth or already has dynamic export
    if (!usesAuth || content.includes(dynamicExport)) {
      continue;
    }
    
    // Add dynamic export after imports
    const lines = content.split('\n');
    let importEndIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || line.startsWith('export * from') || line.startsWith('export { ')) {
        importEndIndex = i;
      } else if (importEndIndex !== -1 && line !== '') {
        // Found first non-import, non-empty line
        break;
      }
    }
    
    if (importEndIndex !== -1) {
      lines.splice(importEndIndex + 1, 0, '', dynamicExport);
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`✅ Fixed: ${file}`);
      fixedFiles++;
    }
  }
  
  console.log(`\n📊 Summary: Fixed ${fixedFiles} files`);
}

fixDynamicPages().catch(console.error);
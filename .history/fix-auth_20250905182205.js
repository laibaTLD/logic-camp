const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/user/preferences/route.ts',
  'src/app/api/admin/teams/route.ts',
  'src/app/api/admin/tasks/route.ts',
  'src/app/api/admin/users/[id]/reject/route.ts',
  'src/app/api/user/avatar/route.ts',
  'src/app/api/user/dashboard/route.ts',
  'src/app/api/admin/projects/route.ts',
  'src/middleware/activityLogger.ts',
  'src/app/api/admin/users/[id]/approve/route.ts',
  'src/app/api/user/activity/route.ts',
  'src/app/api/admin/users/edit/route.ts',
  'src/app/api/projects/route.ts'
];

// Patterns to replace
const replacements = [
  {
    from: /const payload = await verifyToken\(([^)]+)\);\s*if \(!payload\) {/g,
    to: 'const authResult = await verifyToken($1);\n  if (!authResult.success || !authResult.user) {'
  },
  {
    from: /const token = verifyToken\(([^)]+)\);\s*if \(!token\) {/g,
    to: 'const authResult = verifyToken($1);\n  if (!authResult.success || !authResult.user) {'
  },
  {
    from: /payload\.userId/g,
    to: 'authResult.user.userId'
  },
  {
    from: /payload\.role/g,
    to: 'authResult.user.role'
  },
  {
    from: /payload\.email/g,
    to: 'authResult.user.email'
  },
  {
    from: /token\.userId/g,
    to: 'authResult.user.userId'
  },
  {
    from: /token\.role/g,
    to: 'authResult.user.role'
  },
  {
    from: /token\.email/g,
    to: 'authResult.user.email'
  }
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    replacements.forEach(replacement => {
      content = content.replace(replacement.from, replacement.to);
    });
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Auth fix completed!');
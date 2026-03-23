const { execSync } = require('child_process');
const https = require('https');

const token = process.argv[2];
const repoName = 'premium-salon-app';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} }));
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Node.js',
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    console.log('Fetching user details...');
    const userRes = await request({ hostname: 'api.github.com', path: '/user', method: 'GET', headers });
    if (userRes.status !== 200) {
      console.error('Failed to get user:', userRes.body);
      process.exit(1);
    }
    const username = userRes.body.login;
    console.log(`Authenticated as GitHub user: ${username}`);

    console.log(`Creating repository ${repoName}...`);
    const createRes = await request({ hostname: 'api.github.com', path: '/user/repos', method: 'POST', headers }, {
      name: repoName,
      private: false,
      auto_init: false,
      description: 'Premium Salon App Codebase'
    });

    if (createRes.status !== 201 && createRes.status !== 422) {
      console.error('Failed to create repo:', createRes.body);
      process.exit(1);
    }
    console.log(`Repository is ready: https://github.com/${username}/${repoName}`);

    console.log('Configuring local Git and pushing code...');
    const authUrl = `https://oauth2:${token}@github.com/${username}/${repoName}.git`;
    
    try { execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' }); }
    catch { execSync('git init'); }

    try { execSync('git remote remove origin', { stdio: 'ignore' }); } catch {}
    execSync(`git remote add origin "${authUrl}"`);
    
    // Auto-configure git identity if not set
    try { execSync('git config user.email'); } 
    catch { execSync('git config user.email "bot@antigravity.ai" && git config user.name "Antigravity Assistant"'); }

    execSync('git add .');
    try { execSync('git commit -m "Initial commit - Phase 3 Complete"'); } catch { console.log('Already committed'); }
    execSync('git branch -M main');
    execSync('git push -u origin main -f');

    console.log(`\nSUCCESS_URL:https://github.com/${username}/${repoName}`);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

run();

import { execSync } from 'child_process';
import https from 'https';

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
  const headers = {
    'Authorization': \`Bearer \${token}\`,
    'User-Agent': 'Node.js',
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  const userRes = await request({ hostname: 'api.github.com', path: '/user', method: 'GET', headers });
  const username = userRes.body.login;

  console.log('Enabling GitHub Pages on the repository...');
  
  // Create the pages deployment action
  try {
    const pagesRes = await request({ 
      hostname: 'api.github.com', 
      path: \`/repos/\${username}/\${repoName}/pages\`, 
      method: 'POST', 
      headers 
    }, {
      source: { branch: 'gh-pages', path: '/' }
    });
    console.log('Pages configuration response:', pagesRes.status);
  } catch (e) {
    console.log('Pages might already be enabled or setting source failed. Proceeding.');
  }

}

run();

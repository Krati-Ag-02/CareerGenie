import https from 'https';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import 'dotenv/config';

let serviceAccount = null;
let accessToken = null;
let tokenExpiry = 0;

function loadServiceAccount() {
  if (serviceAccount) return serviceAccount;

  const jsonPath = path.resolve('config/serviceAccountKey.json');
  if (fs.existsSync(jsonPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    return serviceAccount;
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
  privateKey = privateKey.replace(/\\n/g, '\n');

  serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  return serviceAccount;
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (accessToken && tokenExpiry > now + 60) return accessToken;

  const sa = loadServiceAccount();
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, 'base64url');
  const jwt = `${header}.${payload}.${signature}`;

  const tokenData = await restPost(
    'https://oauth2.googleapis.com/token',
    null,
    { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt },
    'application/x-www-form-urlencoded'
  );

  accessToken = tokenData.access_token;
  tokenExpiry = now + tokenData.expires_in;
  return accessToken;
}

function restPost(url, token, body, contentType = 'application/json') {
  return new Promise((resolve, reject) => {
    const data = contentType === 'application/json'
      ? JSON.stringify(body)
      : new URLSearchParams(body).toString();

    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }, (res) => {
      let chunks = '';
      res.on('data', (d) => (chunks += d));
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); }
        catch { reject(new Error('Invalid JSON')); }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function fromFirestoreValue(val) {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.booleanValue !== undefined) return val.booleanValue;
  return null;
}

function parseDoc(doc) {
  const data = {};
  for (const key in doc.fields) {
    data[key] = fromFirestoreValue(doc.fields[key]);
  }
  return { id: doc.name.split('/').pop(), data: () => data };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const key in obj) {
    const val = obj[key];
    if (typeof val === 'string') fields[key] = { stringValue: val };
    else if (typeof val === 'number') fields[key] = { integerValue: val };
    else if (typeof val === 'boolean') fields[key] = { booleanValue: val };
    else fields[key] = { stringValue: JSON.stringify(val) };
  }
  return { fields };
}

const db = {
  collection(col) {
    const filters = [];
    let _limit = null;

    const chain = {
      where(field, op, value) {
        filters.push({ field, op, value });
        return chain;
      },

      limit(n) {
        _limit = n;
        return chain;
      },

      async get() {
        const token = await getAccessToken();
        const projectId = loadServiceAccount().project_id;
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;

        const opMap = { '==': 'EQUAL', '!=': 'NOT_EQUAL', '<': 'LESS_THAN', '<=': 'LESS_THAN_OR_EQUAL', '>': 'GREATER_THAN', '>=': 'GREATER_THAN_OR_EQUAL' };

        const structuredQuery = { from: [{ collectionId: col }] };

        if (filters.length > 0) {
          const fieldFilters = filters.map(({ field, op, value }) => ({
            fieldFilter: {
              field: { fieldPath: field },
              op: opMap[op] || 'EQUAL',
              value: typeof value === 'string' ? { stringValue: value }
                : typeof value === 'number' ? { integerValue: value }
                : { booleanValue: value },
            },
          }));

          structuredQuery.where = fieldFilters.length === 1
            ? fieldFilters[0]
            : { compositeFilter: { op: 'AND', filters: fieldFilters } };
        }

        if (_limit) structuredQuery.limit = _limit;

        const results = await restPost(url, token, { structuredQuery });
        const docs = (Array.isArray(results) ? results : [])
          .filter((r) => r.document)
          .map((r) => parseDoc(r.document));

        return { empty: docs.length === 0, docs };
      },

      async add(data) {
        const token = await getAccessToken();
        const projectId = loadServiceAccount().project_id;
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}`;
        return await restPost(url, token, toFirestoreFields(data));
      },
    };

    return chain;
  },
};

function getDb() {
  if (!serviceAccount) loadServiceAccount();
  return db;
}

function initializeFirebase() {
  loadServiceAccount();
  console.log('✅ Firebase REST ready');
  return db;
}

export { initializeFirebase, getDb };
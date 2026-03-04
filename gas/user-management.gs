/**
 * Google Apps Script for handling Firebase Auth deletion and other administrative actions.
 * This version does NOT require any external libraries.
 */

const FIREBASE_PROJECT_ID = "bus-location-checker-service";
// TODO: Replace with your actual domain (e.g., "https://your-name.github.io")
const ALLOWED_DOMAIN = "https://your-name.github.io";

function doPost(e) {
  let params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    params = e.parameter;
  }

  // Domain Security Check
  if (ALLOWED_DOMAIN !== "*" && params.origin !== ALLOWED_DOMAIN) {
    Logger.log(`Unauthorized origin: ${params.origin}`);
    return createJsonResponse({ status: 'error', message: 'Unauthorized domain access denied' });
  }

  const action = params.action;

  if (action === 'deleteUsers' && params.uids) {
    const uids = Array.isArray(params.uids) ? params.uids : [params.uids];
    const results = uids.map(uid => ({
      uid,
      success: deleteFirebaseAuthUser(uid)
    }));

    return createJsonResponse({ status: 'ok', results });
  }

  return createJsonResponse({ status: 'error', message: 'Invalid action or missing parameters' });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteFirebaseAuthUser(uid) {
  const token = getServiceAccountToken();
  if (!token) return false;

  const url = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/accounts:batchDelete`;
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ localIds: [uid] }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();

  if (code !== 200) {
    Logger.log(`Failed to delete user ${uid}: ${response.getContentText()}`);
  }

  return code === 200;
}

/**
 * PRODUCTION SETUP:
 * 1. Create a Service Account in GCP (https://console.cloud.google.com/iam-admin/serviceaccounts)
 * 2. Add "Firebase Authentication Admin" role.
 * 3. Generate a JSON key and copy the values below.
 */
function getServiceAccountToken() {
  const CLIENT_EMAIL = "firebase-adminsdk-xxxxx@xxxxx.iam.gserviceaccount.com";
  const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----";

  if (CLIENT_EMAIL.includes("xxxxx")) {
    Logger.log("Service Account credentials not configured.");
    return null;
  }

  const header = JSON.stringify({
    alg: "RS256",
    typ: "JWT"
  });

  const now = Math.floor(Date.now() / 1000);
  const claimSet = JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/identitytoolkit",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  });

  const encode = (str) => Utilities.base64EncodeWebSafe(str).replace(/=+$/, '');
  const toSign = encode(header) + "." + encode(claimSet);
  const signature = Utilities.computeRsaSha256Signature(toSign, PRIVATE_KEY);
  const jwt = toSign + "." + encode(signature);

  const params = {
    method: "post",
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", params);
    const data = JSON.parse(response.getContentText());
    return data.access_token;
  } catch (e) {
    Logger.log("OAuth token error: " + e.message);
    return null;
  }
}

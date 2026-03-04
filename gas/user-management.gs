/**
 * Google Apps Script for handling Firebase Auth deletion and other administrative actions.
 */

const FIREBASE_PROJECT_ID = "bus-location-checker-service";

function doPost(e) {
  let params;
  try {
    params = JSON.parse(e.postData.contents);
  } catch (err) {
    // Fallback for form-encoded or other formats
    params = e.parameter;
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

  if (action === 'sendNotification') {
    // This is a placeholder for push notification logic
    // Requires Firebase Cloud Messaging API access
    return createJsonResponse({ status: 'ok', message: 'Notification triggered' });
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
 * 1. Add "OAuth2" Library (Script ID: 1B7_5jkDshY_g_8vAk6SkZp09S_UvIjw7on7sl41IdXmYfS_Z_Oa0C8E)
 * 2. Create a Service Account in GCP, download the JSON key.
 * 3. Replace the CLIENT_EMAIL and PRIVATE_KEY placeholders below.
 */
function getServiceAccountToken() {
  const CLIENT_EMAIL = "firebase-adminsdk-xxxxx@xxxxx.iam.gserviceaccount.com";
  const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----";

  if (CLIENT_EMAIL.includes("xxxxx")) {
    Logger.log("Service Account credentials not configured.");
    return null;
  }

  const service = OAuth2.createService('Firebase')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PRIVATE_KEY)
    .setIssuer(CLIENT_EMAIL)
    .setScope('https://www.googleapis.com/auth/identitytoolkit');

  return service.getAccessToken();
}

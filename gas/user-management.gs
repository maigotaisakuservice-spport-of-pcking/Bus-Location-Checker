/**
 * Google Apps Script to handle Firebase Auth user deletion and Push Notifications.
 */

const FIREBASE_PROJECT_ID = "bus-location-checker-service";

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;

  if (action === 'deleteUsers' && params.uids) {
    const results = params.uids.map(uid => ({ uid, success: deleteFirebaseAuthUser(uid) }));
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', results })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'sendNotification' && params.busId && params.stopName) {
    // 1. Get tokens from Firestore for this busId
    // 2. Call Firebase Messaging API
    // Implementation requires Firebase Admin API access from GAS
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok', message: 'Notification triggered' })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
}

function deleteFirebaseAuthUser(uid) {
  const token = getServiceAccountToken();
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/accounts:batchDelete`;
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ localIds: [uid] }),
    muteHttpExceptions: true
  };
  return UrlFetchApp.fetch(url, options).getResponseCode() === 200;
}

function getServiceAccountToken() {
  /**
   * NOTE: To use this in production, you must:
   * 1. Add the "OAuth2" library to your GAS project (Script ID: 1B7_5jkDshY_g_8vAk6SkZp09S_UvIjw7on7sl41IdXmYfS_Z_Oa0C8E)
   * 2. Create a Service Account in GCP and download the JSON key.
   * 3. Use the library to get an access token for 'https://www.googleapis.com/auth/identitytoolkit'
   * 
   * Example:
   * const service = OAuth2.createService('Firebase')
   *   .setTokenUrl('https://oauth2.googleapis.com/token')
   *   .setPrivateKey(PRIVATE_KEY)
   *   .setIssuer(CLIENT_EMAIL)
   *   .setScope('https://www.googleapis.com/auth/identitytoolkit');
   * return service.getAccessToken();
   */
  return "YA29..."; 
}

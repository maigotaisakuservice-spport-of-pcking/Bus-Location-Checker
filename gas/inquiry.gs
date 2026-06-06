/**
 * Google Apps Script for Service Inquiry System.
 * Verifies admin status before showing the contact form.
 */

const FIREBASE_PROJECT_ID = "bus-location-checker-service";

function doGet(e) {
  const uid = e.parameter.uid;

  if (!uid) {
    return HtmlService.createHtmlOutput("<p style='font-family:sans-serif; text-align:center; padding-top:50px;'>エラー: 管理者UIDが必要です。</p>");
  }

  const isAdmin = verifyAdminStatus(uid);
  if (!isAdmin) {
    return HtmlService.createHtmlOutput("<p style='font-family:sans-serif; text-align:center; padding-top:50px;'>エラー: 管理者権限がありません。</p>");
  }

  // Use a template for the inquiry form
  const template = HtmlService.createTemplateFromFile('InquiryForm');
  template.uid = uid;
  return template.evaluate()
      .setTitle('サービス事業者へ問い合わせ')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function verifyAdminStatus(uid) {
  const token = getServiceAccountToken();
  if (!token) return false;

  // Check Firestore for the admin document
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/admins/${uid}`;
  const options = {
    method: 'get',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  return response.getResponseCode() === 200;
}

function processInquiry(formData) {
  // Logic to handle inquiry (e.g., save to Spreadsheet or send Email)
  // For now, we'll log it and return success
  Logger.log("Inquiry received from " + formData.uid + ": " + formData.message);

  // Example: Send email (uncomment and configure if needed)
  /*
  MailApp.sendEmail({
    to: "support@example.com",
    subject: "【Bus-Location-Checker】管理者からの問い合わせ",
    body: "管理者UID: " + formData.uid + "\n内容:\n" + formData.message
  });
  */

  return { status: 'ok', message: '問い合わせを送信しました。' };
}

/**
 * Reused from user-management.gs (should be synchronized in production)
 */
function getServiceAccountToken() {
  const CLIENT_EMAIL = "firebase-adminsdk-xxxxx@xxxxx.iam.gserviceaccount.com";
  const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----";

  if (CLIENT_EMAIL.includes("xxxxx")) return null;

  const header = JSON.stringify({ alg: "RS256", typ: "JWT" });
  const now = Math.floor(Date.now() / 1000);
  const claimSet = JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/datastore",
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
    payload: { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://oauth2.googleapis.com/token", params);
    return JSON.parse(response.getContentText()).access_token;
  } catch (e) { return null; }
}

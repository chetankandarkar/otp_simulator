const SECRET_KEY = 'chetan12345';
const ADMIN_KEY = 'chetan12345';
const SPREADSHEET_ID = '1azYqswLE8q_qNyGEoWGk4pn35KS_WrDfg1xFIS7Y8Oo';
const SHEET_NAME = 'Form_Responses';

/**
 * Main entry point for POST requests
 */
function doPost(e) {
  const ws = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);

  try {
    const params = e.parameter;
    const email = params.email;
    const action = params.action;
    const secretkey = params.secretkey;
    const timestamp = getISTTimestamp();
    const lastRow = ws.getLastRow();
    const nextRow = lastRow + 1;

    ws.getRange(nextRow, 1).setValue(email);
    ws.getRange(nextRow, 2).setValue(timestamp);
    ws.getRange(nextRow, 3).setValue(action);

    // ✅ Validate secret key
    if (secretkey !== SECRET_KEY) {
      ws.getRange(nextRow, 4).setValue('Invalid secret key');
      return jsonResponse({ status: 'error', message: 'Invalid secret key' });
    }

    // ✅ Validate email
    if (!email || !isValidEmail(email)) {
      ws.getRange(nextRow, 4).setValue('Invalid or missing email');
      return jsonResponse({ status: 'error', message: 'Invalid or missing email ID' });
    }

    if (action === 'generateotp') {
      const engineStatus = getEngineStatus();
      if(engineStatus === 'on'){
        return handleGenerateOtp(email, ws, nextRow, timestamp);
      }else{
        return jsonResponse({ status: 'error', message: 'OTP Engine is temporarily stop by admin' });
      }
    } else if (action === 'validateotp') {
      const enteredOtp = params.otp;
      return handleValidateOtp(email, enteredOtp, ws, nextRow);
    } else if (action === 'unlockuser') {
      const adminkey = params.adminkey;
      return handleUnlockUser(email, adminkey, ws, nextRow);
    } else if (action === 'enginestatus') {
      const adminkey = params.adminkey;
      const status = params.status; // Expected: "on" or "off"
     return handleEngineStatus(email, adminkey, status, ws, nextRow);
    }else {
      ws.getRange(nextRow, 4).setValue('Invalid Action Name');
      return jsonResponse({ status: 'error', message: 'Invalid Action Name' });
    }
  } catch (error) {
    Logger.log('Error: ' + error);
    ws.getRange(ws.getLastRow() + 1, 4).setValue(error.toString());
    return jsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Helper: Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Helper: Send JSON response
 */
function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle OTP Generation
 */
function handleGenerateOtp(email, ws, row, timestamp) {
  if (checkUserBlock(email)) {
    ws.getRange(row, 4).setValue('User Blocked for Today');
    return jsonResponse({
      status: 'error',
      message: 'User Blocked for 24 Hours. Please try again tomorrow'
    });
  }

  if (checkEmailExists(email)) {
    ws.getRange(row, 4).setValue('User tried recently');
    return jsonResponse({
      status: 'error',
      message: 'Please try again after 10 minutes'
    });
  }

  const attempt = incrementAttemptCount(email);
  if (attempt > 5) {
    ws.getRange(row, 4).setValue('User Limit Exceeded');
    return jsonResponse({
      status: 'error',
      message: 'User Limit Exceeded for Today. Try again tomorrow'
    });
  }

  const otp = generateOTP();
  const emailSent = sendEmail(email, otp);

  if (!emailSent) {
    ws.getRange(row, 4).setValue('Failed to send OTP');
    return jsonResponse({
      status: 'error',
      message: 'Failed to send OTP. Please try again later.'
    });
  }

  const firebaseUrl = getFirebaseUrl(email);
  const data = {
    email,
    action: 'generateotp',
    otp,
    failcount: '0',
    attempt,
    status: 'Pending',
    timestamp
  };

  UrlFetchApp.fetch(firebaseUrl, {
    method: 'put',
    contentType: 'application/json',
    payload: JSON.stringify(data)
  });

  ws.getRange(row, 4).setValue('OTP Sent Successfully');
  return jsonResponse({
    status: 'success',
    message: 'The OTP has been sent to your email ID'
  });
}

/**
 * Handle OTP Validation
 */
function handleValidateOtp(email, enteredOtp, ws, row) {
  if (!enteredOtp) {
    ws.getRange(row, 4).setValue('Missing OTP');
    return jsonResponse({ status: 'error', message: 'Missing OTP' });
  }

  if (checkUserBlock(email)) {
    ws.getRange(row, 4).setValue('User Blocked for 24 Hours');
    return jsonResponse({ status: 'error', message: 'User Blocked for 24 Hours' });
  }

  const result = verifyOTP(email, enteredOtp);
  ws.getRange(row, 4).setValue(result);

  if (result === 'OTP Verified') {
    const firebaseUrl = getFirebaseUrl(email);
    UrlFetchApp.fetch(firebaseUrl, {
      method: 'patch',
      contentType: 'application/json',
      payload: JSON.stringify({ status: 'Verified', otp: '' })
    });
    return jsonResponse({ status: 'success', message: result });
  }

  return jsonResponse({ status: 'error', message: result });
}

/**
 * Handle Unlock User
 */
function handleUnlockUser(email, adminkey, ws, row) {
  if (adminkey !== ADMIN_KEY) {
    ws.getRange(row, 4).setValue('Invalid Admin Key');
    return jsonResponse({ status: 'error', message: 'Invalid Admin Key' });
  }

  if (deleteUserFromDatabase(email)) {
    ws.getRange(row, 4).setValue('User Unlocked Successfully');
    return jsonResponse({ status: 'success', message: 'User Unlocked Successfully' });
  } else {
    ws.getRange(row, 4).setValue('User Unlocked Failed');
    return jsonResponse({ status: 'error', message: 'User Unlocked Failed or User not found' });
  }
}

/**
 * Utility: Firebase URL
 */
function getFirebaseUrl(email) {
  const safeEmail = email.replace(/\./g, '_');
  return `paste-your-firebase-url-here`;
}

/**
 * Generate OTP
 */
function generateOTP() {
  return (Math.floor(1000 + Math.random() * 9000)).toString();
}

/**
 * Send OTP Email (HTML Version)
 */
function sendEmail(email, otp) {
  try {
    const subject = "Your One-Time Password (OTP) for Verification";

    const plainBody =
      "Dear User,\n\n" +
      "Your One-Time Password (OTP) for verification is:\n[" + otp + "]\n\n" +
      "Please enter this code within 10 minutes to complete your process.\n" +
      "For security reasons, do not share this OTP with anyone.\n\n" +
      "Please note this mail is autogenerated by OTP Simulator only for testing purpose.\n\n" +
      "Regards,\nOTP Simulator";

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <p>Dear User,</p>
        <p>Your <strong>One-Time Password (OTP)</strong> for verification is:</p>
        <div style="margin: 20px 0; padding-left: 40px;">
          <span style="font-size: 24px; font-weight: bold; color: #1a73e8;">${otp}</span>
        </div>
        <p>Please enter this code within <strong>10 minutes</strong> to complete your process.</p>
        <p style="color: #d32f2f;"><em>For security reasons, do not share this OTP with anyone.</em></p>
        <hr style="margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">This email was autogenerated by OTP Simulator for testing purposes only.</p>
        <p>Regards,<br><strong>OTP Simulator</strong></p>
      </div>`;

    GmailApp.sendEmail(email, subject, plainBody, {
      name: 'OTP Simulator',
      htmlBody: htmlBody
    });

    return true; // ✅ Success
  } catch (error) {
    Logger.log('Error sending email to ' + email + ': ' + error);
    return false;
  }
}


/**
 * Check if user is blocked
 */
function checkUserBlock(email) {
  const data = fetchFirebaseData(email);
  if (!data) return false;

  const failcount = parseInt(data.failcount, 10) || 0;
  const timestampDate = new Date(data.timestamp);
  const now = new Date();

  const isToday = timestampDate.toDateString() === now.toDateString();
  return isToday && failcount >= 3;
}

/**
 * Check if user requested recently
 */
function checkEmailExists(email) {
  const data = fetchFirebaseData(email);
  if (!data || !data.timestamp) return false;

  const storedTime = new Date(data.timestamp).getTime();
  const now = Date.now();
  const cooldownPeriod = 10 * 60 * 1000; // 10 minutes

  return (now - storedTime) <= cooldownPeriod && data.status === 'Pending';
}

/**
 * Verify OTP
 */
function verifyOTP(email, enteredOtp) {
  const data = fetchFirebaseData(email);
  if (!data || !data.otp || !data.timestamp) return 'No OTP found';

  const storedTime = new Date(data.timestamp).getTime();
  const now = Date.now();
  const otpValidityPeriod = 10 * 60 * 1000; // 10 minutes

    if ((now - storedTime) > otpValidityPeriod) {
    return 'OTP expired';
  }

  if (enteredOtp !== data.otp) {
    const updatedFailCount = incrementFailCount(email);
    const attemptsLeft = Math.max(0, 3 - updatedFailCount);
    return `Invalid OTP. Attempts left: ${attemptsLeft}`;
  }

  return 'OTP Verified';
}

/**
 * Increment fail count
 */
function incrementFailCount(email) {
  const firebaseUrl = getFirebaseUrl(email);
  const data = fetchFirebaseData(email) || {};
  const failcount = (parseInt(data.failcount, 10) || 0) + 1;

  UrlFetchApp.fetch(firebaseUrl, {
    method: 'patch',
    contentType: 'application/json',
    payload: JSON.stringify({ failcount, timestamp: new Date().toISOString() })
  });

  return failcount;
}

/**
 * Increment daily attempt count
 */
function incrementAttemptCount(email) {
  const firebaseUrl = getFirebaseUrl(email);
  const data = fetchFirebaseData(email) || {};
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const lastAttemptDate = data.timestamp ? new Date(data.timestamp).toISOString().split('T')[0] : null;

  let attempt = 1;
  if (lastAttemptDate === today) {
    attempt = (parseInt(data.attempt, 10) || 0) + 1;
  }

  UrlFetchApp.fetch(firebaseUrl, {
    method: 'patch',
    contentType: 'application/json',
    payload: JSON.stringify({ attempt, timestamp: now.toISOString() })
  });

  return attempt;
}

/**
 * Delete user from Firebase
 */
function deleteUserFromDatabase(email) {
  const firebaseUrl = getFirebaseUrl(email);

  try {
    const response = UrlFetchApp.fetch(firebaseUrl, { method: 'delete', muteHttpExceptions: true });
    return response.getResponseCode() === 200;
  } catch (error) {
    Logger.log('Error deleting user: ' + error);
    return false;
  }
}

/**
 * Fetch data from Firebase
 */
function fetchFirebaseData(email) {
  const firebaseUrl = getFirebaseUrl(email);
  try {
    const response = UrlFetchApp.fetch(firebaseUrl, { method: 'get', muteHttpExceptions: true });
    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log('Error fetching data: ' + error);
    return null;
  }
}

function getISTTimestamp() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().replace('T', ' ').substring(0, 19); // Optional formatting
}

function autoSortByDate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form_Responses");
  const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()); // excludes header
  range.sort({ column: 2, ascending: false }); // Column B is "Date"
}

function onOpen() {
  autoSortByDate();
}

/**
 * Handle Engine Status Update
 */
function handleEngineStatus(email, adminkey, status, ws, row) {
  if (adminkey !== ADMIN_KEY) {
    ws.getRange(row, 4).setValue('Invalid Admin Key');
    return jsonResponse({ status: 'error', message: 'Invalid Admin Key' });
  }

  if (status !== 'on' && status !== 'off') {
    ws.getRange(row, 4).setValue('Invalid Status');
    return jsonResponse({ status: 'error', message: 'Status must be either "on" or "off"' });
  }

  const firebaseUrl = 'https://otp-engine-76ee3-default-rtdb.firebaseio.com/engine.json';

  try {
    UrlFetchApp.fetch(firebaseUrl, {
      method: 'put',
      contentType: 'application/json',
      payload: JSON.stringify({ status })
    });

    ws.getRange(row, 4).setValue(`Engine status set to ${status}`);
    return jsonResponse({ status: 'success', message: `Engine status set to ${status}` });

  } catch (error) {
    ws.getRange(row, 4).setValue('Failed to update engine status');
    return jsonResponse({ status: 'error', message: 'Failed to update engine status' });
  }
}

function getEngineStatus() {
  const ENGINE_URL = 'paste-your-firebase-engine-json-url-here';

  try {
    const response = UrlFetchApp.fetch(ENGINE_URL, { method: 'get', muteHttpExceptions: true });
    const content = response.getContentText();
    const data = JSON.parse(content);

    if (data && data.status) {
      return data.status;
    } else {
      return 'off';
    }

  } catch (error) {
    Logger.log('Error fetching engine status: ' + error);
    return 'off';
  }
}
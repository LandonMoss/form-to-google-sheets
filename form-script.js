/*
Paste this script into the 'Code.gs' tab in the Script Editor
For a detailed explanation of this file, view 'form-script-commented.js'
*/
var sheetName = 'Sheet1';
var scriptProp = PropertiesService.getScriptProperties();


function sendEmailNotification(subject, body) {
  var recipient = "test@test.com"; 
  var senderName = "test";

  MailApp.sendEmail({
    to: recipient,
    subject: subject,
    htmlBody: body,
    name: senderName,
  });
}

  function initialSetup() {
    var activeSpreadSheet = SpreadsheetApp.getActiveSpreadsheet();
    scriptProp.setProperty('key', activeSpreadSheet.getId());
  }

  function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
      var doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));
    var sheet = doc.getSheetByName(sheetName);

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;

    var newRow = headers.map(function(header) {
      return header === 'timestamp' ? new Date() : e.parameter[header];
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    // Send email notification
    var emailSubject = "New Form Submission";
    var emailBody = "A new form submission has been received.";
    sendEmailNotification(emailSubject, emailBody);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    // Send error email notification
    var errorSubject = "Error in Form Submission";
    var errorBody = "An error occurred while processing the form submission:\n" + e;
    sendEmailNotification(errorSubject, errorBody);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
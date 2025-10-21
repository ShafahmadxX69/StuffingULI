import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const body = req.body;
    if (!body || !Array.isArray(body.values) || body.values.length === 0) {
      return res.status(400).send('No data received');
    }

    // Read envs
    const credJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
    const SHEET_NAME = process.env.SHEET_NAME || 'Stuffing';

    if (!credJson || !SPREADSHEET_ID) {
      return res.status(500).send('Server misconfigured: missing env vars');
    }

    // parse credentials (stored as JSON string)
    let creds;
    try {
      creds = JSON.parse(credJson);
    } catch (e) {
      return res.status(500).send('Invalid service account JSON in env');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 1) Clear existing data in A:Z
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
    });

    // 2) Write new data starting A1
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: body.values },
    });

    res.status(200).send('✅ Upload success — sheet overwritten.');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Upload failed: ' + (err.message || err));
  }
}

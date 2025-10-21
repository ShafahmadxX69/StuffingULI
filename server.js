import express from "express";
import { google } from "googleapis";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1XoV7020NTZk1kzqn3F2ks3gOVFJ5arr5NVgUdewWPNQ";
const SHEET_NAME = "Stuffing";

app.post("/upload", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !data.length) return res.status(400).send("No data found.");

    // Clear old data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
    });

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: data },
    });

    res.send("✅ Upload Success! Data replaced in sheet 'Stuffing'.");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Error uploading data.");
  }
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));

import "dotenv/config";
import { sheets } from "@googleapis/sheets";

const API_KEY = process.env.SHEETS_API_KEY;
const spreadsheetId = process.env.SHEETS_ID;

const getClues = async () => {
  const gSheets = sheets({ version: "v4", auth: API_KEY });
  const range = "hints!A2:B"; // Update with your desired rang

  try {
    const result = await gSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return result.data.values;
  } catch (err) {
    console.error("The API returned an error:", err);
  }
};

const getNames = async () => {
  const gSheets = sheets({ version: "v4", auth: API_KEY });
  const range = "namen!A1:M"; // Update with your desired rang

  try {
    const result = await gSheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return result.data.values;
  } catch (err) {
    console.error("The API returned an error:", err);
  }
};

export { getClues, getNames };

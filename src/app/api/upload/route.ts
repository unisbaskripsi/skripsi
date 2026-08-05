import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";

// Initialize Google Auth using OAuth2 (Refresh Token)
const getGoogleAuth = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Google OAuth credentials in environment variables.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return oauth2Client;
};

export async function POST(req: NextRequest) {
  try {
    // === SECURITY CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action in request body" }, { status: 400 });
    }

    const auth = getGoogleAuth();
    
    // ACTION: INIT - Create Resumable Upload Session
    if (action === "init") {
      const { fileName, fileType, fileSize } = body;
      
      if (!fileName || !fileType) {
        return NextResponse.json({ error: "Missing fileName or fileType" }, { status: 400 });
      }

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      if (!folderId) {
        throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID");
      }

      // Get Google Drive Access Token
      const { token } = await auth.getAccessToken();

      // Request Resumable Session URL
      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": fileType,
          "X-Upload-Content-Length": fileSize?.toString() || "0",
        },
        body: JSON.stringify({
          name: fileName,
          parents: [folderId]
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create resumable upload session");
      }

      const uploadUrl = res.headers.get("Location");
      if (!uploadUrl) {
        throw new Error("No Location header returned from Google API");
      }

      return NextResponse.json({ success: true, uploadUrl });
    }
    
    // ACTION: FINALIZE - Set Permissions & Get Link
    else if (action === "finalize") {
      const { fileId } = body;
      
      if (!fileId) {
        return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
      }

      const drive = google.drive({ version: "v3", auth });

      // Share the file publicly so anyone with the link can view it
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      // Get the file links
      const fileRes = await drive.files.get({
        fileId: fileId,
        fields: "id, webViewLink, webContentLink",
      });

      return NextResponse.json({
        success: true,
        fileId: fileRes.data.id,
        webViewLink: fileRes.data.webViewLink,
        webContentLink: fileRes.data.webContentLink,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to process upload request" }, { status: 500 });
  }
}

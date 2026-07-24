import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const authFilePath = path.join(process.cwd(), 'app', 'data', 'admin-auth.json');

function getStoredPassword() {
  try {
    if (fs.existsSync(authFilePath)) {
      const data = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));
      return data.password || "admin123";
    }
  } catch (err) {
    console.error("Error reading admin auth file:", err);
  }
  return "admin123";
}

function setStoredPassword(newPassword) {
  try {
    const dir = path.dirname(authFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(authFilePath, JSON.stringify({ password: newPassword }, null, 2));
    return true;
  } catch (err) {
    console.error("Error writing admin auth file:", err);
    return false;
  }
}

// POST: Verify Admin Password for Login
export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const currentPassword = getStoredPassword();

    if (password === currentPassword) {
      // Create a simple auth token based on current password
      const token = Buffer.from(`admin_authenticated_${currentPassword}_${Date.now()}`).toString('base64');
      return NextResponse.json({ success: true, token });
    } else {
      return NextResponse.json({ error: "Invalid password. Please try again." }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Change / Reset Admin Password
export async function PUT(request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ error: "New password must be at least 4 characters long." }, { status: 400 });
    }

    const storedPassword = getStoredPassword();

    if (currentPassword !== storedPassword) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const success = setStoredPassword(newPassword.trim());
    if (!success) {
      return NextResponse.json({ error: "Failed to update password in storage." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

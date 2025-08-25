// scripts/hashPassword.ts
import bcrypt from "bcryptjs";

async function generateHash() {
  const password = "mnbvcxz"; // change this to your admin password
  const saltRounds = 10;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Plain password: ${password}`);
    console.log(`Bcrypt hash: ${hash}`);
  } catch (err) {
    console.error("Error generating hash:", err);
  }
}

generateHash();

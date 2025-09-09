// Script to generate a valid JWT token for testing
const { SignJWT } = require('jose');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'e3f4b8a1d6c9f7b2a0c3e5f8d1b2a4c7d9e6f8b3c1d2e5f7a0b4c6d8e9f1a2b3';

async function generateToken() {
  const token = await new SignJWT({
    userId: 1,  // Use an ID that exists in your database
    email: 'admin@example.com',
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(JWT_SECRET));

  console.log('Generated token:');
  console.log(token);
  console.log('\nUse this token in your API requests:');
  console.log(`Authorization: Bearer ${token}`);
}

generateToken().catch(console.error);
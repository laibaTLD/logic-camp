import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.delete({
    name: 'authToken',
    path: '/',
  });
  return response;
}
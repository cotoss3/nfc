import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORE_FILE = path.join(process.cwd(), 'db_store.json');

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
    }

    let store: Record<string, any> = {};
    if (fs.existsSync(STORE_FILE)) {
      try {
        store = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      } catch {
        store = {};
      }
    }

    store[key] = value;
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');

    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error('Error saving server db store:', error);
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

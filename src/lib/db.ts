import mongoose from 'mongoose';

const { MONGODB_URI } = process.env as { MONGODB_URI?: string };

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not set. Set it in .env.local');
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: Cached | undefined;
}

let cached: Cached = global._mongooseCache || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  global._mongooseCache = cached;
  return cached.conn;
}

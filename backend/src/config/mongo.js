import dotenv from 'dotenv';

dotenv.config();

export const getMongoUri = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set.');
  }

  const parsed = new URL(uri);
  const databaseName = parsed.pathname.replace(/^\/+/, '');

  if (databaseName !== 'securechat') {
    throw new Error(`MONGODB_URI must point to the securechat database, but it points to ${databaseName || 'no database'}.`);
  }

  return uri;
};
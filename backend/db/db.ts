import { connect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config()
export async function connectDB() {
  const mongourl=process.env.MONGDODB_URI
  console.log(mongourl)
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hire';
  await connect(uri);
  console.log('MongoDB connected');
}

import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

export const User = model('User', userSchema);

const leadSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Lost'],
    default: 'New',
  },
  source: {
    type: String,
    enum: ['Website', 'Instagram', 'Referral'],
    default: 'Website',
  },
}, { timestamps: true });

export const Lead = model('Lead', leadSchema);

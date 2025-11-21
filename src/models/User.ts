import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from '../types/telegraf.js';

export interface IUserDocument extends IUser, Document {}

const UserSchema: Schema = new Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  firstName: String,
  lastName: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUserDocument>('User', UserSchema);

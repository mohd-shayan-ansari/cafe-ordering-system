import { Schema, model, models } from 'mongoose';

export type UserRole = 'customer' | 'staff';

const UserSchema = new Schema({
  role: { type: String, enum: ['customer', 'staff'], default: 'customer', required: true },
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  photoUrl: { type: String },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

export interface IUser {
  role: UserRole;
  phone: string;
  name: string;
  photoUrl?: string;
  passwordHash: string;
}

const User = models.User || model('User', UserSchema);
export default User;

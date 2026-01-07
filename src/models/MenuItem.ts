import { Schema, model, models } from 'mongoose';

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true, required: true },
}, { timestamps: true });

export interface IMenuItem {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);
export default MenuItem;

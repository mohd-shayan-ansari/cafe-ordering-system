import { Schema, model, models, Types } from 'mongoose';

export type OrderStatus = 'Placed' | 'PaymentReceived' | 'Preparing' | 'Ready' | 'HandedOver' | 'Cancelled';

const OrderItemSchema = new Schema({
  menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceAtOrder: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Placed', 'PaymentReceived', 'Preparing', 'Ready', 'HandedOver', 'Cancelled'], default: 'Placed', required: true },
}, { timestamps: true });

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  quantity: number;
  priceAtOrder: number;
}

export interface IOrder {
  customerId: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
}

const Order = models.Order || model('Order', OrderSchema);
export default Order;

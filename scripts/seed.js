// Run this script once to seed initial menu items
// Usage: node scripts/seed.js
const mongoose = require('mongoose');

const menuItems = [
    { name: 'Coffee', description: 'Hot brewed coffee', price: 50, isAvailable: true },
    { name: 'Tea', description: 'Masala chai', price: 30, isAvailable: true },
    { name: 'Sandwich', description: 'Veg club sandwich', price: 80, isAvailable: true },
    { name: 'Burger', description: 'Cheese burger with fries', price: 120, isAvailable: true },
    { name: 'Pizza Slice', description: 'Margherita pizza slice', price: 60, isAvailable: true },
    { name: 'Samosa', description: 'Crispy potato samosa', price: 20, isAvailable: true },
    { name: 'Cold Drink', description: 'Chilled soft drink', price: 40, isAvailable: true },
];

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mohdshayan0010_db_user:87976757@shayan.pbatlzj.mongodb.net/?appName=Shayan';

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const MenuItemSchema = new mongoose.Schema({
            name: String,
            description: String,
            price: Number,
            imageUrl: String,
            isAvailable: Boolean,
        });

        const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

        const count = await MenuItem.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} menu items. Skipping seed.`);
            process.exit(0);
        }

        await MenuItem.insertMany(menuItems);
        console.log(`Seeded ${menuItems.length} menu items successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
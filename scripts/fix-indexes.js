// Fix MongoDB index issue - Run once
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI environment variable is not set');
    console.log('Please set MONGODB_URI in your .env.local file or as an environment variable');
    process.exit(1);
}

async function fixIndexes() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Get all indexes
        const indexes = await ordersCollection.indexes();
        console.log('Current indexes:', indexes);

        // Drop the problematic orderId_1 index if it exists
        try {
            await ordersCollection.dropIndex('orderId_1');
            console.log('✓ Dropped orderId_1 index');
        } catch (e) {
            console.log('Index orderId_1 not found or already dropped');
        }

        // Verify indexes after
        const newIndexes = await ordersCollection.indexes();
        console.log('Indexes after cleanup:', newIndexes);

        console.log('\n✓ Fix complete! Try placing an order now.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixIndexes();
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        const db = mongoose.connection.db;

        // Count documents
        const ordersCount = await db.collection('orders').countDocuments();
        const usersCount = await db.collection('users').countDocuments();
        console.log('Total Orders:', ordersCount);
        console.log('Total Users:', usersCount);

        // Get sample orders
        console.log('\n--- Sample Orders ---');
        const orders = await db.collection('orders').find().limit(5).toArray();
        orders.forEach(order => {
            console.log({
                _id: order._id.toString(),
                customerId: order.customerId ? order.customerId.toString() : 'NULL',
                customerIdType: order.customerId ? typeof order.customerId : 'undefined',
                status: order.status,
                totalAmount: order.totalAmount,
                itemsCount: order.items ? .length || 0
            });
        });

        // Get all users
        console.log('\n--- All Users ---');
        const users = await db.collection('users').find().toArray();
        users.forEach(user => {
            console.log({
                _id: user._id.toString(),
                name: user.name,
                role: user.role,
                phone: user.phone
            });
        });

        // Check if customerIds match user _ids
        console.log('\n--- Validation ---');
        const userIds = users.map(u => u._id.toString());
        orders.forEach(order => {
            const customerIdStr = order.customerId ? order.customerId.toString() : null;
            const matchesUser = customerIdStr ? userIds.includes(customerIdStr) : false;
            console.log(`Order ${order._id.toString().substring(0, 8)}... - customerId matches user: ${matchesUser ? '✓' : '✗'}`);
        });

        await mongoose.disconnect();
        console.log('\n✓ Database check complete');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkDatabase();
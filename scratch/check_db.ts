import { prisma } from '../src/app/db_connection/prisma';

async function checkData() {
    try {
        const count = await prisma.food.count();
        console.log(`Total food items: ${count}`);
        const items = await prisma.food.findMany({
            where: { name: { contains: 'Beef', mode: 'insensitive' } },
            take: 5
        });
        console.log('Sample items:', JSON.stringify(items, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();

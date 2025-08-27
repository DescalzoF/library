import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env.test' });

import { beforeAll, beforeEach, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.$connect();
});

beforeEach(async () => {
    await prisma.favorite.deleteMany();
    await prisma.book.deleteMany();
});

afterAll(async () => {
    await prisma.favorite.deleteMany();
    await prisma.book.deleteMany();
    await prisma.$disconnect();
});

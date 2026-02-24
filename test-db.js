// Allow self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    console.log('Testing database connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')
    console.log('Result:', result)
  } catch (error) {
    console.log('❌ Database connection failed!')
    console.log('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()

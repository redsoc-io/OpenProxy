const { PrismaClient } = require("@prisma/client");

const db =
  globalThis.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

module.exports = db;

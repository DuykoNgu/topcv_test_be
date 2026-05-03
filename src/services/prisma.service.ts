import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for PrismaClient");
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
export default prisma;

import { Pool } from "pg";
import dotenv from "dotenv";

const envFile =
    process.env.NODE_ENV === "production"
        ? ".env.production.local"
        : ".env.development.local";

dotenv.config({
    path: envFile,
});

const password = process.env.DB_PASSWORD;

if (typeof password !== "string" || password.length === 0) {
    throw new Error(
        `DB_PASSWORD is missing or not a string. Ensure ${envFile} exists (or env vars are set) before connecting.`,
    );
}

export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password,
    port: parseInt(process.env.DB_PORT ?? "5432", 10),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
    console.log(
        `Connected to the ${process.env.NODE_ENV} database (${process.env.DB_NAME})`,
    );
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

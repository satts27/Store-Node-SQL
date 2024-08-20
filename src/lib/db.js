// lib/db.js
import sql from "mssql";

// MSSQL configuration
const config = {
  user: "sa",
  password: "root",
  server: "localhost", // or your server IP
  database: "ISS",
  port: 1433,
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // For local development
  },
};

// Create a connection pool
const poolPromise = sql
  .connect(config)
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1); // Exit the process if the connection fails
  });

export default poolPromise;

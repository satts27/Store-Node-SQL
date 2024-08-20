// src/app/api/users/route.js
import { NextResponse } from "next/server";
import poolPromise from "@/lib/db";

export async function GET() {
  try {
    // Retrieve the connection pool
    const pool = await poolPromise;

    // Execute a query
    const result = await pool.request().query("SELECT * FROM PLAYERS");

    // Return the result as JSON
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

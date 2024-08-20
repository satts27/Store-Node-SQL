import { NextResponse } from "next/server";
import poolPromise from "@/lib/db";
import sql from "mssql";

export async function GET(request) {
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "";

  try {
    const pool = await poolPromise;

    // Modify the query to include filtering
    const result = await pool
      .request()
      .input("filter", sql.NVarChar, `%${filter}%`).query(`
        SELECT * FROM Products
        WHERE Name LIKE @filter OR Category LIKE @filter
      `);

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Failed to fetch filtered products:", error);
    return NextResponse.json(
      { error: "Failed to fetch filtered products." },
      { status: 500 }
    );
  }
}

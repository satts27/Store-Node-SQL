import { NextResponse } from "next/server";
import poolPromise from "@/lib/db";
import sql from "mssql";

export async function POST(request) {
  try {
    // Parse the incoming request body
    const { username, password } = await request.json();

    // Retrieve the connection pool
    const pool = await poolPromise;

    // Check if the username already exists
    const checkQuery = `SELECT * FROM Users WHERE Username = @username`;
    const checkResult = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(checkQuery);

    if (checkResult.recordset.length > 0) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Insert the new user into the database
    const insertQuery = `INSERT INTO Users (Username, Password) VALUES (@username, @password)`;
    await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password) // Store password as plaintext
      .query(insertQuery);

    return NextResponse.json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

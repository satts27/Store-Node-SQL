import { NextResponse } from "next/server";
import poolPromise from "@/lib/db";
import jwt from "jsonwebtoken";
import sql from "mssql";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Log the incoming request data
    console.log("Request data:", { username, password });

    // Get the connection pool
    const pool = await poolPromise;

    // Define the query to check for the username
    const query = `SELECT * FROM Users WHERE Username = @username`;
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username) // Use sql.NVarChar for Username
      .query(query);

    // Log the query result
    console.log("Database result:", result.recordset);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Directly compare the password (plaintext)
      if (password === user.Password) {
        // Generate JWT
        const token = jwt.sign(
          { userId: user.Id, username: user.Username },
          JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );

        return NextResponse.json({ message: "Login successful", token });
      } else {
        return NextResponse.json(
          { message: "Invalid credentials" },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

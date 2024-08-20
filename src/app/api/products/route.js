import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import poolPromise from "@/lib/db";
import sql from "mssql";
import { Buffer } from "buffer";

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the JWT token
    verify(token, SECRET_KEY);

    // Get the connection pool
    const pool = await poolPromise;

    // Query to get all products
    const result = await pool.request().query("SELECT * FROM Products");

    // Convert image data to base64 if it exists
    const products = result.recordset.map((product) => ({
      ...product,
      img: product.img ? Buffer.from(product.img).toString("base64") : null,
    }));

    return NextResponse.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

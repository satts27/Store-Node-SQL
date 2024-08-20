import { NextResponse } from "next/server";
import poolPromise from "@/lib/db";
import sql from "mssql";

export async function POST(request) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const quantity = formData.get("quantity");
    const category = formData.get("category");
    const img = formData.get("img");

    // Check for missing fields
    if (!name || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert img to buffer if it's present
    let imgBuffer = null;
    if (img) {
      imgBuffer = Buffer.from(await img.arrayBuffer());
    }

    // Get the connection pool
    const pool = await poolPromise;

    // Insert the new product into the database
    await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("description", sql.Text, description)
      .input("quantity", sql.Int, quantity)
      .input("category", sql.NVarChar, category)
      .input("img", sql.VarBinary, imgBuffer).query(`
        INSERT INTO Products (Name, Description, Quantity, Category, img)
        VALUES (@name, @description, @quantity, @category, @img)
      `);

    // Return a success response
    return NextResponse.json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Add product error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

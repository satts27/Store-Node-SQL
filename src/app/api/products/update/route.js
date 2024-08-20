// api/products/update/route.js

import { NextResponse } from "next/server";
import poolPromise from "@/lib/db";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import sql from "mssql";

// To handle file uploads, ensure that you set `multipart/form-data` content type in the request.
export async function PUT(request) {
  // Initialize formidable form
  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "/public/uploads"); // Ensure you have this directory
  form.keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(request, async (err, fields, files) => {
      if (err) {
        return resolve(
          NextResponse.json(
            { error: "Failed to parse form data" },
            { status: 400 }
          )
        );
      }

      const { id, name, quantity, category } = fields;
      const { img } = files;

      try {
        const pool = await poolPromise;
        let imgPath = null;

        if (img && img[0]) {
          // Read image file as base64 if provided
          imgPath = fs.readFileSync(img[0].filepath).toString("base64");
        } else {
          // Retrieve current image from database if no new image is provided
          const existingProduct = await pool
            .request()
            .input("id", sql.Int, id)
            .query("SELECT Img FROM Products WHERE Id = @id");

          if (existingProduct.recordset.length > 0) {
            imgPath = existingProduct.recordset[0].Img;
          }
        }

        const result = await pool
          .request()
          .input("id", sql.Int, id)
          .input("name", sql.NVarChar, name)
          .input("quantity", sql.Int, quantity)
          .input("category", sql.NVarChar, category)
          .input("img", sql.VarBinary, imgPath) // Adjust type if needed
          .query(`
            UPDATE Products
            SET Name = @name, Quantity = @quantity, Category = @category, Img = @img
            WHERE Id = @id
          `);

        if (result.rowsAffected[0] > 0) {
          resolve(
            NextResponse.json({ message: "Product updated successfully" })
          );
        } else {
          resolve(
            NextResponse.json({ error: "Product not found" }, { status: 404 })
          );
        }
      } catch (error) {
        console.error("Failed to update product:", error);
        resolve(
          NextResponse.json(
            { error: "Failed to update product." },
            { status: 500 }
          )
        );
      }
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

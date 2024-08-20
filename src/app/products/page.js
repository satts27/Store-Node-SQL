// products/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showUpdateProductForm, setShowUpdateProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: "",
    category: "",
    img: null,
  });
  const [updateProduct, setUpdateProduct] = useState({
    id: "",
    name: "",
    quantity: "",
    category: "",
    img: null,
  });
  const [filter, setFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check for JWT token
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch products if authenticated
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          setFilteredProducts(data); // Initialize filteredProducts
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to load products.");
        }
      } catch (err) {
        setError("An error occurred while fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  useEffect(() => {
    // Filter products based on the filter text
    const filtered = products.filter(
      (product) =>
        product.Name.toLowerCase().includes(filter.toLowerCase()) ||
        product.Category.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [filter, products]);

  const handleLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; // Clear token cookie
    router.push("/login");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.quantity || !newProduct.img) {
      setError("Please provide name, quantity, and an image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("quantity", newProduct.quantity);
    formData.append("category", newProduct.category || ""); // Default to empty if not provided
    formData.append("img", newProduct.img);

    try {
      const response = await fetch("/api/products/add", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Clear form and hide it
        setShowAddProductForm(false);
        setNewProduct({ name: "", quantity: "", category: "", img: null });

        // Refetch products
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add product.");
      }
    } catch (err) {
      setError("An error occurred while adding the product.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`/api/products/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        // Remove the deleted product from the state
        setProducts(products.filter((product) => product.Id !== id));
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete product.");
      }
    } catch (err) {
      setError("An error occurred while deleting the product.");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!updateProduct.name || !updateProduct.quantity) {
      setError("Please provide name and quantity.");
      return;
    }

    const formData = new FormData();
    formData.append("id", updateProduct.id);
    formData.append("name", updateProduct.name);
    formData.append("quantity", updateProduct.quantity);
    formData.append("category", updateProduct.category || ""); // Default to empty if not provided
    if (updateProduct.img) {
      formData.append("img", updateProduct.img);
    }

    try {
      const response = await fetch("/api/products/update", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        // Clear form and hide it
        setShowUpdateProductForm(false);
        setUpdateProduct({
          id: "",
          name: "",
          quantity: "",
          category: "",
          img: null,
        });

        // Refetch products
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update product.");
      }
    } catch (err) {
      setError("An error occurred while updating the product.");
    }
  };

  return (
    <div>
      <h1>Products</h1>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => setShowAddProductForm(!showAddProductForm)}>
        {showAddProductForm ? "Cancel" : "Add Product"}
      </button>

      <div>
        <input
          type="text"
          placeholder="Filter products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {showAddProductForm && (
        <form onSubmit={handleAddProduct}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Quantity:</label>
            <input
              type="number"
              value={newProduct.quantity}
              onChange={(e) =>
                setNewProduct({ ...newProduct, quantity: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Category:</label>
            <input
              type="text"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            />
          </div>
          <div>
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setNewProduct({ ...newProduct, img: e.target.files[0] })
              }
              required
            />
          </div>
          <button type="submit">Submit</button>
          {error && <p>{error}</p>}
        </form>
      )}

      {showUpdateProductForm && (
        <form onSubmit={handleUpdateProduct}>
          <div>
            <label>ID:</label>
            <input
              type="text"
              value={updateProduct.id}
              onChange={(e) =>
                setUpdateProduct({ ...updateProduct, id: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={updateProduct.name}
              onChange={(e) =>
                setUpdateProduct({ ...updateProduct, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Quantity:</label>
            <input
              type="number"
              value={updateProduct.quantity}
              onChange={(e) =>
                setUpdateProduct({ ...updateProduct, quantity: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Category:</label>
            <input
              type="text"
              value={updateProduct.category}
              onChange={(e) =>
                setUpdateProduct({ ...updateProduct, category: e.target.value })
              }
            />
          </div>
          <div>
            <label>Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setUpdateProduct({ ...updateProduct, img: e.target.files[0] })
              }
            />
          </div>
          <button type="submit">Update</button>
          {error && <p>{error}</p>}
        </form>
      )}

      <div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.Id}>
              <h3>{product.Name}</h3>
              <p>Quantity: {product.Quantity}</p>
              <p>Category: {product.Category}</p>
              {product.img && (
                <img
                  src={`data:image/jpeg;base64,${product.img}`}
                  alt={`Product ${product.Name}`}
                  style={{ width: "200px", height: "auto" }} // Adjust as needed
                />
              )}
              <button onClick={() => handleDeleteProduct(product.Id)}>
                Delete
              </button>
              <button
                onClick={() => {
                  setUpdateProduct({
                    id: product.Id,
                    name: product.Name,
                    quantity: product.Quantity,
                    category: product.Category,
                    img: null,
                  });
                  setShowUpdateProductForm(true);
                }}
              >
                Update
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Products;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in by looking for the JWT token in cookies
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));
    setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists
  }, []);

  const handleLogout = () => {
    // Clear the JWT token and redirect to the login page
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"; // Clear token cookie
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav>
      <ul>
        {!isLoggedIn ? (
          <>
            <li>
              <a href="/login">Login</a>
            </li>
            <li>
              <a href="/register">Register</a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a href="/products">Products</a>
            </li>
            <li>
              <a href="/your-products">Your Products</a>
            </li>
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

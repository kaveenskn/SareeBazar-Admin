const http = require("http");

function request(url, method, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on("error", (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  const email = `testuser_${Date.now()}@example.com`;
  const password = "Password123";
  const name = "Test User";

  console.log("1. Registering user...");
  try {
    const regRes = await request("http://localhost:5001/api/auth/register", "POST", {
      name,
      email,
      password,
    });
    console.log("Register response:", regRes);
  } catch (e) {
    console.error("Register failed:", e.message);
  }

  console.log("\n2. Logging in...");
  let token = "";
  try {
    const loginRes = await request("http://localhost:5001/api/auth/login", "POST", {
      email,
      password,
    });
    console.log("Login response status:", loginRes.statusCode);
    token = loginRes.body.accessToken;
    if (!token) {
      console.error("No token returned!");
      return;
    }
  } catch (e) {
    console.error("Login failed:", e.message);
    return;
  }

  console.log("\n3. Placing order...");
  try {
    const orderPayload = {
      items: [
        {
          productId: "6656ca89ea123456789abcde", // string id (like mongodb objectid)
          slug: "test-saree",
          name: "Test Saree",
          selectedColor: "Crimson Red",
          selectedColorHex: "#DC143C",
          selectedColorImage: "http://localhost:5001/uploads/test.jpg",
          quantity: 1,
          price: 5500,
          originalPrice: 6500,
          image: "http://localhost:5001/uploads/test.jpg",
          category: "Saree",
          fabric: "Silk",
        },
      ],
      shipping: {
        fullName: "Test User",
        email: email,
        phone: "0771234567",
        addressLine1: "123 Galle Road",
        addressLine2: "",
        city: "Colombo",
        state: "Western",
        postalCode: "00300",
        country: "Sri Lanka",
      },
      subtotal: 5500,
      shippingFee: 350,
      discount: 0,
      total: 5850,
      paymentMethod: "Cash on Delivery",
    };

    const orderRes = await request("http://localhost:5001/api/orders", "POST", orderPayload, {
      Authorization: `Bearer ${token}`,
    });

    console.log("Order placement response code:", orderRes.statusCode);
    console.log("Order placement response body:", JSON.stringify(orderRes.body, null, 2));
  } catch (e) {
    console.error("Order placement request failed:", e.message);
  }
}

run();

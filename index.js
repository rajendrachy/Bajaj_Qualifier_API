require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;


function fibonacci(n) {
  if (n <= 0) return [];
  const series = [0, 1];
  for (let i = 2; i < n; i++) {
    series.push(series[i - 1] + series[i - 2]);
  }
  return series.slice(0, n);
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(arr) {
  return arr.reduce((a, b) => (a * b) / gcd(a, b));
}


app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL,
  });
});


app.post("/bfhl", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        is_success: false,
        message: "Invalid or empty request body",
      });
    }

    const body = req.body;
    const keys = Object.keys(body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Request must contain exactly one key",
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        if (!Number.isInteger(body[key]) || body[key] < 0) {
          throw new Error("Invalid fibonacci input");
        }
        data = fibonacci(body[key]);
        break;

      case "prime":
        if (!Array.isArray(body[key])) {
          throw new Error("Prime expects an array");
        }
        data = body[key].filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body[key])) {
          throw new Error("LCM expects an array");
        }
        data = lcm(body[key]);
        break;

      case "hcf":
        if (!Array.isArray(body[key])) {
          throw new Error("HCF expects an array");
        }
        data = hcf(body[key]);
        break;

      case "AI":
        if (typeof body[key] !== "string") {
          throw new Error("AI expects a string");
        }

        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [{ text: body[key] }],
              },
            ],
          }
        );

        data = geminiResponse.data.candidates[0].content.parts[0].text
          .replace(/[^a-zA-Z ]/g, "")
          .trim()
          .split(" ")[0];

        break;

      default:
        throw new Error("Invalid key");
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data: data,
    });
  } catch (err) {
    res.status(400).json({
      is_success: false,
      message: err.message,
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

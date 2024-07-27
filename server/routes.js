const express = require('express');
const router = express.Router();

router.post("/Login", (req, res) => {
  res.status(200).json({ msg: "POST REQUEST TO https://wildcats-food-express.onrender.com/login" });
});

router.post("/register", (req, res) => {
  res.status(200).json({ msg: "POST REQUEST TO https://wildcats-food-express.onrender.com/register" });
});

router.get("/admin", (req, res) => {
  res.status(200).json({ msg: "GET REQUEST TO https://wildcats-food-express.onrender.com/admin" });
});

router.get("/dashboard", (req, res) => {
  res.status(200).json({ msg: "GET REQUEST TO https://wildcats-food-express.onrender.com/dashboard" });
});

router.get("/client-interface", (req, res) => {
  res.status(200).json({ msg: "GET REQUEST TO https://wildcats-food-express.onrender.com/client-interface" });
});

router.post("/logout", (req, res) => {
  res.status(200).json({ msg: "POST REQUEST TO https://wildcats-food-express.onrender.com/logout" });
});

router.post("/forgot-password", (req, res) => {
  res.status(200).json({ msg: "POST REQUEST TO https://wildcats-food-express.onrender.com/forgot-password" });
});

router.post("/reset-password/:token", (req, res) => {
  res.status(200).json({ msg: "POST REQUEST TO https://wildcats-food-express.onrender.com/reset-password/:token" });
});

// Add other routes as needed

module.exports = router;
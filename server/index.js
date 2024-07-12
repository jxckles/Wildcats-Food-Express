const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import fs module
const UserModel = require("./models/User");
const MenuItem = require("./models/Menu");
const Order = require("./models/Order");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const nodemailer = require("nodemailer");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// Static folder for images

app.use("/Images", express.static(path.join(__dirname, "public/Images")));

mongoose.connect(
  "mongodb+srv://castroy092003:7xiHqTSiUKH0ZIf4@wildcats-food-express.7w2snhk.mongodb.net/User?retryWrites=true&w=majority&appName=Wildcats-Food-Express"
);

// Multer setup for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/Login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then((user) => {
      if (user) {
        // Directly compare passwords (not recommended)
        if (password === user.password) {
          const role = user.role;
          const userID = user._id;
          const accessToken = jwt.sign(
            { email: email, role: role },
            "jwt-access-token-secret-key",
            { expiresIn: "1m" }
          );
          const refreshToken = jwt.sign(
            { email: email, role: role },
            "jwt-refresh-access-token-secret-key",
            { expiresIn: "1h" }
          );
          res.cookie("accessToken", accessToken, { maxAge: 15 * 60 * 1000 });
          res.cookie("refreshToken", refreshToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          return res.json({ role, userID });
        } else {
          return res.json("Incorrect password");
        }
      } else {
        return res.json("User does not exist");
      }
    })
    .catch((err) => {
      return res.status(500).json({ message: "Server error" });
    });
});

const verifyUser = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res
      .status(401)
      .json({ valid: false, message: "Access token missing" });
  }

  jwt.verify(accessToken, "jwt-access-token-secret-key", (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ valid: false, message: "Invalid access token" });
    }

    req.email = decoded.email;
    req.role = decoded.role;

    next();
  });
};

const renewToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.json({ valid: false, message: "No Refresh Token" });
  } else {
    jwt.verify(
      refreshToken,
      "jwt-refresh-access-token-secret-key",
      (err, decoded) => {
        if (err) {
          return res.json({ valid: false, message: "Invalid Refresh Token" });
        } else {
          const accessToken = jwt.sign(
            { email: decoded.email, role: decoded.role },
            "jwt-access-token-secret-key",
            { expiresIn: "1m" }
          );
          res.cookie("accessToken", accessToken, { maxAge: 60000 });
          req.email = decoded.email;
          req.role = decoded.role;
          return true;
        }
      }
    );
  }
};

app.get("/admin", verifyUser, (req, res) => {
  if (req.role !== "Admin") {
    return res
      .status(403)
      .json({ valid: false, message: "Forbidden: Admins only" });
  }
  return res.json({ valid: true, message: "Welcome Admin", role: req.role });
});

app.get("/dashboard", verifyUser, (req, res) => {
  if (req.role !== "User") {
    return res
      .status(403)
      .json({ valid: false, message: "Forbidden: Users only" });
  }
  return res.json({ valid: true, message: "Welcome User", role: req.role });
});

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  return res.json({ message: "Logged out successfully" });
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: "User not registered" });
    }

    const token = jwt.sign({ id: user._id }, "jwt-access-token-secret-key", {
      expiresIn: "5m",
    });

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "wildcatfoodexpress@gmail.com",
        pass: "rofq crlc rvam atah",
      },
    });

    var mailOptions = {
      from: "wildcatfoodexpress@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.json({ message: "Error sending email" });
      } else {
        return res.json({ status: true, message: "Email sent" });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, "jwt-access-token-secret-key");
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid token or user does not exist" });
    }
    user.password = password;
    await user.save();
    res.json({ status: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

app.post("/Register", (req, res) => {
  const { email } = req.body;
  UserModel.findOne({ email: email }).then((existingUser) => {
    if (existingUser) {
      res.json("Email already exists");
    } else {
      UserModel.create(req.body)
        .then((User) => res.json(User))
        .catch((err) => res.status(400).json(err));
    }
  });
});

// Menu item route
app.get("/menu", async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Modified to handle image upload
app.post("/menu", upload.single("image"), async (req, res) => {
  try {
    const item = new MenuItem({
      ...req.body,
      image: req.file.path, // Save the path of the uploaded image
    });
    const savedItem = await item.save();
    res.json(savedItem);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.put("/menu/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path; // Update image path if a new image is uploaded
    }
    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(item);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.delete("/menu/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete the image file if it exists
    if (item.image) {
      fs.unlink(item.image, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
        } else {
          console.log("Image file deleted successfully");
        }
      });
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting menu item:", err); // Log the error
    res.status(400).json(err);
  }
});

//for placing orders
app.post("/orders", async (req, res) => {
  const { userId, menusOrdered, studentNumber, status, totalPrice } = req.body;

  console.log("Received Order Payload:", JSON.stringify(req.body, null, 2));

  if (
    !userId ||
    !Array.isArray(menusOrdered) ||
    !studentNumber ||
    !totalPrice
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create a new order
    const newOrder = new Order({
      userId,
      menusOrdered,
      studentNumber,
      status,
      totalPrice,
    });

    // Save the new order to the database
    await newOrder.save({ session });

    // Update the quantities of the ordered menu items
    for (const orderedMenu of menusOrdered) {
      // Find the menu item by name instead of ID
      const menuItem = await MenuItem.findOne({
        name: orderedMenu.itemName,
      }).session(session);
      if (!menuItem) {
        throw new Error(
          `Menu item with name ${orderedMenu.menuName} not found`
        );
      }
      if (menuItem.quantity < orderedMenu.quantity) {
        throw new Error(`Not enough quantity for menu item: ${menuItem.name}`);
      }
      menuItem.quantity -= orderedMenu.quantity; // Subtract the ordered quantity from the available quantity
      await menuItem.save({ session }); // Save the updated menu item back to the database
    }

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error placing order:", error.message);
    res.status(500).json({
      message: `Failed to place order. Please try again. ${error.message}`,
    });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const userId = req.query.userId; // Or req.headers['userId'] if sent in headers
    const orders = await Order.find({ userId: userId }); // Assuming 'userId' is the field name in the Order model
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UserModel = require("./models/User");
const MenuItem = require("./models/Menu");
const Order = require("./models/Order");
const History = require("./models/History.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const nodemailer = require("nodemailer");
const ClientOrder = require("./models/ClientOrder");

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
          const userName = user.firstName + " " + user.lastName;
          const accessToken = jwt.sign(
            { email: email, role: role },
            "jwt-access-token-secret-key",
            { expiresIn: "7d" } // Access token valid for 2 days
          );
          const refreshToken = jwt.sign(
            { email: email, role: role },
            "jwt-refresh-access-token-secret-key",
            { expiresIn: "7d" } // Refresh token valid for 2 days
          );
          res.cookie("accessToken", accessToken, { maxAge: 15 * 60 * 1000 }); // 15 minutes
          res.cookie("refreshToken", refreshToken, {
            maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          return res.json({ role, userID, userName });
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

app.get("/client-interface", verifyUser, (req, res) => {
  if (req.role !== "Admin") {
    return res
      .status(403)
      .json({ valid: false, message: "Forbidden: Admins only" });
  }
  return res.json({ valid: true, message: "Welcome Admin", role: req.role });
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
      // Since profile picture is added later, it's initially set to null
      UserModel.create({ ...req.body, profilePicture: null })
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
    console.error("Error deleting menu item:", err);
    res.status(400).json(err);
  }
});


app.get('/menu/:id/quantity', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).send({ message: 'Item not found' });
    }
    res.send({ quantity: item.quantity });
  } catch (error) {
    res.status(500).send({ message: 'Error fetching item quantity', error });
  }
});

//for placing orders
app.post("/orders", async (req, res) => {
  const { userId, userName, menusOrdered, studentNumber, status, totalPrice } =
    req.body;

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
    // create a new order
    const newOrder = new Order({
      userId,
      userName,
      menusOrdered,
      studentNumber,
      status,
      totalPrice,
    });

    await newOrder.save({ session });

    // update the quantities of the ordered menu items
    for (const orderedMenu of menusOrdered) {
      // find the menu item
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
      menuItem.quantity -= orderedMenu.quantity;
      await menuItem.save({ session });
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
    const userId = req.query.userId;
    let orders;
    //check if the user is the admin
    if (userId === "668e8d77cfc185e3ac2d32a5") {
      orders = await Order.find({});
    } else {
      orders = await Order.find({ userId: userId });
    }
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

//for client order interface; handle place order

app.post('/clientorders', async (req, res) => {
  try {
    const { schoolId, items, status, priorityNumber } = req.body;

    if (!schoolId || !items || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOrder = new ClientOrder({
      schoolId,
      items,
      status,
      priorityNumber: priorityNumber || Math.floor(Math.random() * 1000000), // Generate if not provided
    });

    await newOrder.validate(); // Validate schema before saving
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
});

app.post('/update-quantity', async (req, res) => {
  const { itemId, quantityChange } = req.body;

  try {
    const item = await MenuItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity += quantityChange;
    await item.save();

    res.json({ message: 'Quantity updated', item });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

app.get('/clientorders', async (req, res) => {
  try {
    const orders = await ClientOrder.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching client orders:", error);
    res.status(500).json({ message: "Failed to fetch client orders", error: error.message });
  }
});


//for change password

app.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    if (user.password !== oldPassword) {
      return res.status(400).send("Old password is incorrect.");
    }

    user.password = newPassword;
    await user.save();

    res.send("Password successfully changed.");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred.");
  }
});

//history of orders
async function getHistoryOrdersByUserId(userId) {
  try {
    let query = {};
    //check if admin
    if (userId !== "668e8d77cfc185e3ac2d32a5") {
      query.userId = userId;
    }
    const orders = await History.find(query);
    return orders;
  } catch (error) {
    console.error("Error fetching orders from database:", error);
    throw error;
  }
}

app.get("/history-orders", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).send("UserID is required");
    }
    const orders = await getHistoryOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching history orders:", error);
    res.status(500).send("Internal Server Error");
  }
});

//get user data
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await UserModel.findById(userId).exec();
    if (user) {
      res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        courseYear: user.courseYear,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//updating user data
app.put(
  "/update-profile/:userId",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const { firstName, lastName, courseYear } = req.body;
      const updateData = {
        firstName,
        lastName,
        courseYear,
      };

      if (req.file) {
        updateData.profilePicture = `/Images/${req.file.filename}`;
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );
      if (updatedUser) {
        res.json({
          message: "Profile updated successfully!",
          user: updatedUser,
        });
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//order status
app.put("/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    //check if status compelete delete from order and move to history
    if (status === "Completed" || status === "Cancelled") {
      const historyOrder = new History(order.toObject());
      await historyOrder.save();
      await Order.deleteOne({ _id: orderId });

      return res
        .status(200)
        .send({ message: "Order completed and moved to history" });
    }

    res.status(200).send(order);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error updating order status" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

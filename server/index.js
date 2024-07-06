const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const UserModel = require("./models/User");
const MenuItem = require("./models/Menu");

const app = express();

app.use(express.json());
app.use(cors());

// Static folder for images
app.use(
  "/public/Images",
  express.static(path.join(__dirname, "public/Images"))
);

mongoose.connect(
  "mongodb+srv://castroy092003:7xiHqTSiUKH0ZIf4@wildcats-food-express.7w2snhk.mongodb.net/User?retryWrites=true&w=majority&appName=Wildcats-Food-Express"
);

// Multer setup for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/Images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

const upload = multer({ storage: storage });

app.post("/Login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      if (user.email == "admin@gmail.com" && user.password == "admin") {
        res.json("Admin");
      } else if (user.password === password) {
        res.json("Success");
      } else {
        res.json("Incorrect password");
      }
    } else {
      res.json("User does not exist");
    }
  });
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

//Menu item route
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

app.put("/menu/:id", async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(item);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.delete("/menu/:id", async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

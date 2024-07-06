const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/User");
const MenuItem = require("./models/Menu");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://castroy092003:7xiHqTSiUKH0ZIf4@wildcats-food-express.7w2snhk.mongodb.net/User?retryWrites=true&w=majority&appName=Wildcats-Food-Express"
);

app.post("/Login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user.email == "admin@gmail.com") {
      if (user.password === password) {
        res.json("Admin");
      } 
      else  {
        res.json("Incorrect password"); 
      } 
    }
    else if(user){
      if(user.password === password){
        res.json("Success");
      }
      else{
        res.json("Incorrect password")
      }
    } 
    else {
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

app.get("/menu", (req, res) => {
  MenuItem.find()
    .then((items) => res.json(items))
    .catch((err) => res.status(400).json(err));
});

app.post("/menu", (req, res) => {
  MenuItem.create(req.body)
    .then((item) => res.json(item))
    .catch((err) => res.status(400).json(err));
});

app.put("/menu/:id", (req, res) => {
  MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((item) => res.json(item))
    .catch((err) => res.status(400).json(err));
});

app.delete("/menu/:id", (req, res) => {
  MenuItem.findByIdAndDelete(req.params.id)
    .then(() => res.json({ message: "Item deleted" }))
    .catch((err) => res.status(400).json(err));
});



app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

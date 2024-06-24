const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
const User = require("./models/User");
const Post = require("./models/Post");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const salt = bcrypt.genSaltSync(10);
const secret = "sadakjdhkadd";
const uploadsDir = path.join(__dirname, 'uploads');
const uploadMiddleware = multer({ dest: uploadsDir });

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(cookieParser());

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/", (req, res) => {
  res.json("hello");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.findOne({ username });
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({ id: userDoc._id, username });
      });
    } else {
      res.status(400).json("wrong credentials");
    }
  } catch (e) {
    console.error(e);
    res.status(500).json("Internal Server Error");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) {
      console.error(err);
      res.status(401).json("Unauthorized");
    } else {
      res.json(info);
    }
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path: filePath } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = filePath + "." + ext;
  fs.renameSync(filePath, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      console.error(err);
      res.status(401).json("Unauthorized");
    } else {
      const { title, summary, content } = req.body;
      try {
        const postDoc = await Post.create({
          title,
          summary,
          content,
          cover: newPath,
          author: info.id,
        });
        res.json(postDoc);
      } catch (e) {
        console.error(e);
        res.status(500).json("Internal Server Error");
      }
    }
  });
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path: filePath } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = filePath + "." + ext;
    fs.renameSync(filePath, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, {}, async (err, info) => {
    if (err) {
      console.error(err);
      res.status(401).json("Unauthorized");
    } else {
      const { id, title, summary, content } = req.body;
      try {
        const postDoc = await Post.findById(id);
        const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
        if (!isAuthor) {
          return res.status(400).json("you are not the author");
        }
        await postDoc.updateOne({
          title,
          summary,
          content,
          cover: newPath ? newPath : postDoc.cover,
        });
        res.json(postDoc);
      } catch (e) {
        console.error(e);
        res.status(500).json("Internal Server Error");
      }
    }
  });
});

app.get("/post", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", ["username"]).sort({ createdAt: -1 }).limit(20);
    res.json(posts);
  } catch (e) {
    console.error(e);
    res.status(500).json("Internal Server Error");
  }
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findById(id).populate("author", ["username"]);
    res.json(postDoc);
  } catch (e) {
    console.error(e);
    res.status(500).json("Internal Server Error");
  }
});

app.delete("/post/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await Post.findByIdAndDelete(id);
    res.json({ message: "Post deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json("Internal Server Error");
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});

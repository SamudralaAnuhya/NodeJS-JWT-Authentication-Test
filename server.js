const express = require("express");
const app = express();

const port = 3000;
const path = require("path");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { expressjwt: exjwt } = require("express-jwt");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "Content-type, Authorization");
  next();
});

const secretKey = process.env.SECRET_KEY || "do not hardcode, only for test";

const jwtmw = exjwt({ secret: secretKey, algorithms: ["HS256"] });

let users = [
  { id: 1, username: "anuhya", password: "1234" },
  { id: 2, username: "itsme", password: "mypass" },
];

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  for (let user of users) {
    if (user.username === username && user.password === password) {
      let token = jwt.sign(
        { id: user.id, username: user.username },
        secretKey,
        {
          expiresIn: '3m', // code to set  expiration time to 3 minutes
        }
      );
      res.json({
        message: `Welcome ${user.username}!`,
        token: token,
        success: true,
      });
      break;
    } else {
      res.status(401).json({
        message: "Invalid Credentials",
        success: false,
        err: "Username or password incorrect",
        token: null,
      });
    }
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      success: false,
      officialError: err,
      err: "username or password incorrect",
    });
  } else {
    next(err);
  }
});

app.get("/api/dashboard", jwtmw, (req, res) => {
  res.json({
    success: true,
    myContent: "This is your private content, it is not visible to others",
  });
});

app.get("/api/settings", jwtmw, (req, res) => {
  res.json({
    success: true,
    myContent: "Please use this page to update settings, it is not visible to others",
  });
});
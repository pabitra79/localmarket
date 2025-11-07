require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const flash = require("connect-flash");
const cookieparser = require("cookie-parser");

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(cookieparser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const Dbconnection = require("./app/config/db");
Dbconnection();

const router = require("./app/routes/authroutes");
app.use(router);

const productroute = require("./app/routes/productroute");
app.use(productroute);

const orderRoute = require("./app/routes/orderRouter");
app.use("/api/orders", orderRoute);

const cartRoute = require("./app/routes/cartRoute");
app.use("/api/cart", cartRoute);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.listen(3007, () => {
  console.log("server port is 3007");
});

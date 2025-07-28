const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;
const route = require("./routes/route");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(express.static(path.join(__dirname, "public")));

// Import your routes
app.use("/", route);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("views", "./views");


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

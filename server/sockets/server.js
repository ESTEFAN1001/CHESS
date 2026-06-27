// imports
const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

require("dotenv").config();

// middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../front/views/index.html"));
});
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../front/views/login.html"));
});
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "../front/views/register.html"));
});

// sockets settings
io.on("connection", (socket) => {
    console.log("user connected");
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

// port
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var db_js_1 = require("./config/db.js");
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 5000;
app.use(express_1.default.json());
// Simple test route
app.get('/', function (_req, res) {
    res.send('Hello, Kanban!');
});
await (0, db_js_1.connectDB)();
app.listen(PORT, function () {
    console.log("\uD83D\uDE80 Server running on http://localhost:".concat(PORT));
});

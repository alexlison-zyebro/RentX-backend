require("dotenv").config();
const express = require("express")
const connectDB = require("./config/db")

const app = express()

connectDB();

app.use(express.json())

app.listen(process.env.PORT || 4000,() => {

    console.log("Sever Running at Port",process.env.PORT)
});
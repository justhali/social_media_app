const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users")
const authRoute = require("./routes/auth")
const postRoute = require("./routes/posts")

dotenv.config();

// Connection to the DB (MongoDB)
mongoose.connect(process.env.MONGO_URL,
    (err) => {
        if (err) console.log(err)
        else console.log("mongdb is connected");
    }
);

// MIDDLEWARE
// Express is a body parser for POST request
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// ROUTES
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(8800, () => {
    console.log("Backend server is running!")
});
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from './routes/user.routes.js'; // Import userRouter

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Mount userRouter at the specified route
app.use("/api/v1/users", userRouter);

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to the homepage");
});

export default app;
    
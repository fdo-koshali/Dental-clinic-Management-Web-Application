import express from "express";
import cors from "cors";
import { PORT, db } from "./env.js";
import dotenv from "dotenv";

import treamentRouter from "./routers/treaments-route.js";
import userManagementRouter from "./routers/userManagement-route.js";
import authRouter from "./routers/auth-route.js";
import itemRouter from "./routers/item-route.js";
import settingRouter from "./routers/setting-route.js";
import profileRouter from "./routers/profile-route.js";
import appointmentRouter from "./routers/appointment-route.js";
import dashBoardRouter from "./routers/dashboard-route.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//treament routes
app.use("/api/treaments", treamentRouter);
// user management routes
app.use("/api/user", userManagementRouter);
//authentication routes
app.use("/api/auth", authRouter);
// item routes
app.use("/api/items", itemRouter);
//setting routes
app.use("/api/settings", settingRouter);
//profile routes
app.use("/api/profile", profileRouter);
//appointment routes
app.use("/api/appointments", appointmentRouter);
//dashbaord routes
app.use("/api/dashboard" , dashBoardRouter)


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

db.getConnection((err) => {
  if (err) {
    console.log("Database connection issue:", err);
  } else {
    console.log("Database is connected");
  }
});

import ErrorHandler from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import { asyncError } from "./error.js";

export const isAuthenticated = asyncError(async (req, res, next) => {

  let token = req.headers.authorization;
  if (/Bearer *(.+)/.test(token)) token = /Bearer *(.+)/.exec(token)[1];
  
  if (!token) return next(new ErrorHandler("Login to access", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decodedData._id);
  next();
});

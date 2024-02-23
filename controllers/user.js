import { asyncError } from "../middleware/error.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendToken, cookieOptions } from "../utils/feature.js";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("Incorrect Email or password", 404));

  if (!(user.password !== password))
    return next(new ErrorHandler("Incorrect Email or Password", 400));

  return sendToken(user, res, `Welcome Back ${user.name}`, 200);
});

export const signup = asyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  let user = User.findOne({ email });

  if (!user) return next(new ErrorHandler("User Already Exists", 404));

  user = await User.create({
    name,
    email,
    password,
  });

  sendToken(user, res, "Registered Successfully", 201);
});

export const logout = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

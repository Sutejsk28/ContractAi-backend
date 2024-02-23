import DataURIParser from "datauri/parser.js";
import path from "path";

export const sendToken = (user, res, message, statusCode) => {
  const token = user.generateToken();

  return res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      secure: true,
      httpOnly: false, // Allow JavaScript to access the cookie
      sameSite: "None",
    })
    .json({
      success: true,
      message: message,
      token: token,
    });
};

export const cookieOptions = {
  secure: !(process.env.NODE_ENV === "development"),
  httpOnly: !(process.env.NODE_ENV === "development"),
  sameSite: "Lax",
};

export const getDataUri = (file) => {
  const parser = new DataURIParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

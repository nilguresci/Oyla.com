const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

exports.register = async (req, res, next) => {
  const { Firstname, Lastname, Username, City, Email, Password } = req.body;

  try {
    const user = await User.create({
      Firstname,
      Lastname,
      Username,
      City,
      Email,
      Password,
    });

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { Username, Password } = req.body;

  if (!Username || !Password)
    return next(
      new ErrorResponse("Please provide an username and password", 400)
    );

  try {
    const user = await User.findOne({ Username }).select("+Password");
    if (!user) return next(new ErrorResponse("Invalid credentials", 401));

    const isMatch = await user.matchPassword(Password);
    if (!isMatch) return next(new ErrorResponse("Invalid credentials", 401));

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  const token = await jwt.sign(
    { id: req.body.Userid },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
  res.status(200).json({ success: true, token });
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res
    .status(statusCode)
    .json({ sucess: true, token, Username: user.Username, userid: user._id });
};

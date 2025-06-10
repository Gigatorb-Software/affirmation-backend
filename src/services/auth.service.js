const bcrypt = require("bcrypt");
const prisma = require("../config/db");
const { generateToken } = require("../utils/jwt");

exports.register = async ({
  firstName,
  lastName,
  dob,
  username,
  email,
  password,
  phone,
  gender,
}) => {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      dob: new Date(dob),
      username,
      email,
      password: hashedPassword,
      phone,
      gender,
      isAdmin: false, // Default to false for new registrations
    },
  });

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    token,
  };
};

exports.login = async ({ identifier, password }) => {
  // Find user by email OR username
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Compare hashed password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    token,
  };
};

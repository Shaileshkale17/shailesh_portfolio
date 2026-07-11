import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import AppError from "../utils/AppError.js";

/**
 * Authenticates a user by email/password and issues a JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: import("mongoose").Document, token: string }>}
 * @throws {AppError} 401 if the credentials are invalid.
 */
const login = async (email, password) => {
  // `password` has `select: false` on the schema, so it must be explicitly requested.
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id, user.role);
  return { user, token };
};

/**
 * Creates a new admin/editor user and issues a JWT.
 *
 * Intended for seeding the very first admin account. The route this backs
 * (`POST /api/auth/register`) is intentionally public so an admin can be
 * created before any auth exists — consider disabling or protecting this
 * route once the first admin has been created, since as-is anyone can
 * create an account.
 *
 * @param {{ name: string, email: string, password: string, role?: string }} input
 * @returns {Promise<{ user: import("mongoose").Document, token: string }>}
 * @throws {AppError} 400 if the email is already registered.
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("A user with that email already exists", 400);
  }

  const user = await User.create({ name, email, password, role: role || "admin" });
  const token = generateToken(user._id, user.role);
  return { user, token };
};

export default { login, register };

import jwt from "jsonwebtoken";

/**
 * Signs a JWT for a given user.
 *
 * The token embeds the user's id and role so `authMiddleware.protect` can
 * identify the user, and `authMiddleware.authorize` can check permissions
 * without hitting the database on every request (the DB lookup in
 * `protect` still happens to make sure the user still exists, but the role
 * check itself is fast/local).
 *
 * @param {string} id - MongoDB ObjectId of the user, as a string.
 * @param {string} role - User's role, e.g. "admin" | "editor".
 * @returns {string} Signed JWT.
 */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;

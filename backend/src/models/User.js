import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User schema — admin/editor accounts that can authenticate and manage
 * portfolio content. There is no public self-signup; accounts are created
 * via `POST /api/auth/register` (intended for seeding the first admin) or
 * directly by an existing admin.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // `select: false` keeps the password hash out of query results by
    // default; it must be explicitly requested with `.select("+password")`
    // (see authService.login).
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "admin" },
  },
  { timestamps: true }
);

/**
 * Hashes the password before saving, but only if it was actually changed
 * (so updating other fields on a user doesn't re-hash an already-hashed
 * password).
 */
userSchema.pre("save", async function hashPasswordIfModified(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares a plaintext password against this user's stored hash.
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// `unique: true` above already creates an index on `email`.

export default mongoose.model("User", userSchema);

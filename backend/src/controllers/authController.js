import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { validateRequiredFields } from "../utils/validators.js";
import authService from "../services/authService.js";

/**
 * Shapes a User document into the safe, public-facing fields returned to
 * the client after login/register (never includes the password hash).
 * @param {import("mongoose").Document} user
 * @param {string} token
 */
const toAuthResponse = (user, token) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token,
});

/**
 * @desc    Log in an admin/editor user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateRequiredFields(req.body, ["email", "password"]);

  const { user, token } = await authService.login(email, password);
  ApiResponse.success(res, 200, "Logged in successfully", toAuthResponse(user, token));
});

/**
 * @desc    Get the currently authenticated user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 200, "Current user fetched successfully", req.user);
});

/**
 * @desc    Register a new admin/editor user
 * @route   POST /api/auth/register
 * @access  Public (intended for seeding the first admin — see authService.register
 *          for a note on locking this down once that account exists)
 */
export const register = asyncHandler(async (req, res) => {
  validateRequiredFields(req.body, ["name", "email", "password"]);

  const { user, token } = await authService.register(req.body);
  ApiResponse.success(res, 201, "User registered successfully", toAuthResponse(user, token));
});

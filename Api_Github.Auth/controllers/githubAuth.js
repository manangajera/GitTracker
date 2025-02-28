import axios from "axios";
import GithubUser from "../models/githubUser.js";
import dotenv from "dotenv";

dotenv.config();

// GitHub OAuth URLs
const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user,read:org`;
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";

/**
 * Redirect user to GitHub OAuth page
 */
export const redirectToGithub = (req, res) => {
  const GitURL = process.env.GITHUB_AUTH_URL || GITHUB_AUTH_URL;
  try {
    if (!GitURL) {
      throw new Error("GitHub authentication URL is not defined.");
    }
    res.redirect(GitURL);
  } catch (error) {
    console.error("Error redirecting to GitHub:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error. Unable to redirect to GitHub." });
  }
};

/**
 * GitHub OAuth callback
 */
export const githubCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code)
      return res.status(400).json({ error: "Authorization code missing" });

    // Exchange code for access token
    const tokenResponse = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken)
      return res.status(400).json({ error: "Failed to obtain access token" });

    // Fetch GitHub user data
    const userResponse = await axios.get(GITHUB_USER_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id, login, email, avatar_url } = userResponse.data;

    // Check if user already exists
    let user = await GithubUser.findOne({ github_id: id });

    if (user) {
      user.access_token = accessToken; // Update token if needed
      // user.last_used_at = new Date();
      user.last_synced_at = new Date(); // Update last sync time
    } else {
      // Create new user
      user = new GithubUser({
        github_id: parseInt(id),
        username: login,
        email,
        avatar_url,
        access_token: accessToken,
        last_synced_at: new Date().toLocaleString(), // Set last synced time for new user
      });
    }

    await user.save();
    res.cookie("access_Token", accessToken, {
      httpOnly: true, // Prevents client-side access
      // secure: process.env.NODE_ENV === "production", // Set true in production
      sameSite: "strict", // Protects from CSRF
      maxAge: 3600000, // 1 hour
    });

    res.redirect(`http://localhost:5173/auth/success?username=${login}&avatar_url=${avatar_url}&last_synced_at=${user.last_synced_at.toISOString()}`);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Fetch authenticated user details
 */
export const getAuthenticatedUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await GithubUser.findOne({ github_id: userId });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
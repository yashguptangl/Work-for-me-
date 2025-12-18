import express from "express";
const userDash = express.Router();
import { userAuth } from "../middleware/auth"; // Import your auth middleware
import {
    userDetails,
    getUserWishlist,
    addWishlist,
    deleteFromWishlist,
    updateUserProfile
} from "../controllers/user.dashboard.controllers";

userDash.get("/profile", userAuth, userDetails);
userDash.get("/wishlist", userAuth, getUserWishlist);
userDash.post("/add/wishlist", userAuth, addWishlist);
userDash.delete("/wishlist/delete", userAuth, deleteFromWishlist);
// Removed legacy /wishlist/:propertyId route referencing non-existent removeFromWishlist
userDash.put("/profile", userAuth, updateUserProfile);

export default userDash;

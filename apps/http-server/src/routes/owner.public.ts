import express from "express";
import { getPublicOwnerProfile, getPublicOwnerProperties } from "../controllers/owner.public.controllers";

const publicOwnerRouter = express.Router();

// GET /api/v1/owner/public-profile/:id
publicOwnerRouter.get("/public-profile/:id", getPublicOwnerProfile);
// GET /api/v1/owner/public-properties/:id
publicOwnerRouter.get("/public-properties/:id", getPublicOwnerProperties);

export default publicOwnerRouter;

import express from "express";
const ownerListing = express.Router();
import { ownerAuth } from "../middleware/auth"; // Import your auth middleware

import {
    createPropertyController,
    uploadImagesController,
    getOwnerPropertiesController,
    getPropertyByIdController,
    togglePropertyAvailabilityController,
    updatePropertyController,
    deletePropertyController,
    publishPropertyController
} from "../controllers/owner.listing.controllers";


ownerListing.post("/create", ownerAuth, createPropertyController);
ownerListing.get("/my-properties", ownerAuth, getOwnerPropertiesController);
ownerListing.get("/:id", ownerAuth, getPropertyByIdController); // Auth required for single property fetch
ownerListing.post("/upload-images", ownerAuth, uploadImagesController);
ownerListing.patch("/toggle-availability/:id", ownerAuth, togglePropertyAvailabilityController);
ownerListing.patch("/publish/:id", ownerAuth, publishPropertyController); // New publish route
ownerListing.put("/update-property/:id", ownerAuth, updatePropertyController);
ownerListing.delete("/:id", ownerAuth, deletePropertyController); // New delete route

export default ownerListing;

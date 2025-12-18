import express from "express";
const locationRouter = express.Router();
import { nearMeController, reverseGeocodeController } from "../controllers/location.controllers";

locationRouter.get("/near", nearMeController);
// Use POST for reverse geocoding since coordinates are sent in the body
locationRouter.post("/reverse-geocode", reverseGeocodeController);

export default locationRouter;
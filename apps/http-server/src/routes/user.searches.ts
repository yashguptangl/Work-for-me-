import express from "express";
import { searchListings , getPropertyById , filterProperties, searchNearMe, getAvailableTownSectors } from "../controllers/user.searches.controllers";
const searchRouter = express.Router();


searchRouter.get("/property" , searchListings);
searchRouter.get("/property/:id" , getPropertyById);
searchRouter.get("/filters" , filterProperties);
searchRouter.get("/near-me" , searchNearMe);
searchRouter.get("/available-areas" , getAvailableTownSectors);

export default searchRouter;
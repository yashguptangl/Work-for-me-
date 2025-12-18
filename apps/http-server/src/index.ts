import "dotenv/config";
import express from "express";
import cors from "cors";
import userAuth from "./routes/user.auth";
import ownerAuth from "./routes/owner.auth";
import ownerListing from "./routes/owner.listing";
import searchRoutes from "./routes/user.searches";
import userDash from "./routes/user.dashboard";
import contactRouter from "./routes/contact"
import locationRouter from "./routes/location";
import tempVerification from "./routes/temp.Mobile.verify";

const app = express();

app.use(express.json());

app.use(cors());
app.use("/api/v1/user/auth" , userAuth);
app.use("/api/v1/owner/auth" , ownerAuth);
app.use("/api/v1/owner/property" , ownerListing);
app.use("/api/v1/search" , searchRoutes);
app.use("/api/v1/user" , userDash);
app.use("/api/v1/contact", contactRouter)
app.use("/api/v1/near" , locationRouter);
app.use("/api/v1" , tempVerification);



app.get("/api/health" , (req, res) =>{
    res.send("Work Health")
})


app.listen(3001 , () =>{
    console.log("Server is running on port 3001");
});
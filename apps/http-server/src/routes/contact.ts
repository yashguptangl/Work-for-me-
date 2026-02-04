import { Router } from "express";
import { userAuth, ownerAuth } from "../middleware/auth";
import {
    userContactController,
    userContactDeleted,
    ownerContactDeleted, 
    userContactFullDetails,
    ownerContactFullDetails,
    generalContacts
}
    from "../controllers/contact.controllers";

const contactRouter = Router();

//User
contactRouter.post("/contact", userAuth, userContactController);
contactRouter.delete("/contact/:id/user/delete", userAuth, userContactDeleted );

//Owner
contactRouter.delete("/contact/:id/owner/delete" , ownerAuth , ownerContactDeleted)


//User And Owner Dashboard Contact Routes 
contactRouter.get("/user/contacts", userAuth , userContactFullDetails );
contactRouter.get("/owner/contacts" , ownerAuth , ownerContactFullDetails )


// Changed the method from GET to POST for the generalContacts route
contactRouter.post("/general-contact", generalContacts);
export default contactRouter;

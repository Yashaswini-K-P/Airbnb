const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listings.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const { cloudinary } = require("../cloudConfig.js");

const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

const listingController = require("../controllers/listing.js");


router.route("/")
    .get(wrapAsync(listingController.index))
    // .post(
    //     isLoggedIn,
    //     validateListing,  
    //     wrapAsync(listingController.createListing)
    // );
   .post(upload.single("listing[image]"), (req, res)=>{
        res.send(req.file);
   });

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put( 
        isLoggedIn, 
        isOwner,
        validateListing,  
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn,  
        wrapAsync(listingController.destroylisting)
    );




//show route
router.get("/:id",  wrapAsync(listingController.showListing));



//edit route
router.get("/:id/edit",
     isLoggedIn,
     isOwner,
     wrapAsync(listingController.renderEditForm));

module.exports = router;

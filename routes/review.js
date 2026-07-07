const express = require("express");
const router = express.Router({mergeParams: true});
const listing = require("../models/listings.js")
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js"); 
const Review = require("../models/reviews.js");
const Users = require("../models/user.js");
const {validateReview, isLoggedIn ,isAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReviews));


// router.post("/listings/:id/reviews", validateReview,  wrapAsync(async(req, res)=>{
//     let list = await listing.findById(req.params.id);
//     let newReview = new Review(req.body.review);

//     list.reviews.push(newReview._id);

    

//     await newReview.save();
//     await list.save();
//     console.log("new review saved");
//     res.redirect(`/listings/${list._id}`);
// }));

//delete review route
router.delete("/:reviewId", isLoggedIn, isAuthor,
    wrapAsync(reviewController.destroyReview)
);

module.exports = router;
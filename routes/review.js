const express = require("express");
const router = express.Router({mergeParams: true});
const listing = require("../models/listings.js")
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js"); 
const Review = require("../models/reviews.js");
const Users = require("../models/user.js");
const {validateReview, isLoggedIn ,isAuthor} = require("../middleware.js");



router.post("/", validateReview, wrapAsync(async(req, res) => {
    let list = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    let AuthorId = newReview.author;
    await newReview.save();

    

    list.reviews.push(newReview._id);
    await list.save();
    req.flash("success", "New Review Created!");
    console.log("Saved listing");

    res.redirect(`/listings/${list._id}`);
}));


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
    wrapAsync(async (req, res)=>{
        let {id, reviewId} = req.params;
        await listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted!");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;
const listing = require("../models/listings.js");
const Review = require("../models/reviews.js");

module.exports.createReviews = async(req, res) => {
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
};

module.exports.destroyReview = async (req, res)=>{
    let {id, reviewId} = req.params;
    await listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
};
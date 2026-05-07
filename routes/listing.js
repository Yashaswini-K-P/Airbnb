const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listings.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");



//index route
router.get("/",  wrapAsync(async(req, res)=>{
    const allListings = await listing.find({});
    res.render("listings/index.ejs", {allListings})
}));

//new route
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const list = await listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author",
        },
    })
    .populate("owner");
    if(!list){
        req.flash("error", "Listing you requesteed does not exist");
         return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {list});
}));

//create route
router.post("/", isLoggedIn, validateListing,  wrapAsync(async(req, res)=>{
    const newList = new listing(req.body.listing);
    newList.owner = req.user._id;
    await newList.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit",
     isLoggedIn,
     isOwner,
     wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const Elisting = await listing.findById(id);
    if(!Elisting){
        req.flash("error", "Listing you requesteed does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {Elisting});
}));

//update route
router.put("/:id", 
    isLoggedIn, 
    isOwner,
    validateListing,  wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`)
}));

//delete route
router.delete("/:id", isLoggedIn,  wrapAsync(async(req, res)=>{
    let {id} =req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;

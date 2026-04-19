const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js"); 
const listing = require("../models/listings.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//index route
router.get("/",  wrapAsync(async(req, res)=>{
    const allListings = await listing.find({});
    res.render("listings/index.ejs", {allListings})
}));

//new route
router.get("/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//show route
router.get("/:id",  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const list = await listing.findById(id).populate("reviews");
    if(!list){
        req.flash("error", "Listing you requesteed does not exist");
         return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {list});
}));

//create route
router.post("/", validateListing,  wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    const newList = new listing(req.body.listing);
    await newList.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

//edit route
router.get("/:id/edit",  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const Elisting = await listing.findById(id);
    if(!Elisting){
        req.flash("error", "Listing you requesteed does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {Elisting});
}));

//update route
router.put("/:id", validateListing,  wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`)
}));

//delete route
router.delete("/:id", wrapAsync(async(req, res)=>{
    let {id} =req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;

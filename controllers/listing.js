const listing = require("../models/listings.js");

module.exports.index = async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const list = await listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!list) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
};

module.exports.createListing = async (req, res) => {
    const newList = new listing(req.body.listing);
    newList.owner = req.user._id;
    
    if (!req.body.listing.image || !req.body.listing.image.url) {
        newList.image = {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3"
        };
    }
    
    await newList.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const Elisting = await listing.findById(id);
    if (!Elisting) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { Elisting });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let Ulisting = await listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });
    
    if (!Ulisting.image || !Ulisting.image.url) {
        Ulisting.image = {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3"
        };
        await Ulisting.save();
    }
    
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroylisting = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
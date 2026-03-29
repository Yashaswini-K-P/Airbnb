const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listings.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js"); 


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connect to db");
}).catch((err)=>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



app.get("/", (req, res)=>{
    res.send("Hello airbnb");
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};


app.get("/listings",  wrapAsync(async(req, res)=>{
    const allListings = await listing.find({});
    res.render("listings/index.ejs", {allListings})
}));

//new route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id",  wrapAsync(async(req, res)=>{

    let {id} = req.params;
    const list = await listing.findById(id);
    res.render("listings/show.ejs", {list});
}));

//create route
app.post("/listings", validateListing,  wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    const newList = new listing(req.body.listing);
    await newList.save();
    res.redirect("/listings");
}));
//edit route
app.get("/listings/:id/edit",  wrapAsync(async(req, res)=>{
    let {id} = req.params;
    const Elisting = await listing.findById(id);
    res.render("listings/edit.ejs", {Elisting});
}));

//update route
app.put("/listings/:id", validateListing,  wrapAsync(async(req, res)=>{
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    let {id} = req.params;
    await listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`)
}));

//delete route
app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    let {id} =req.params;
    let deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong!"}=err;
    res.status(statusCode).render("error.ejs"  ,{err})
})

app.listen(8080, ()=>{
    console.log("Server is listening");
});
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const multer = require("multer");
const About = require("./models/about.models");
const TeamMember = require("./models/ourteam.models");
const Services = require("./models/services.model");
const Contact = require("./models/contact.models");
const Pricing = require("./models/pricing.models");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.use(
  session({
    secret: "your-secret-key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use `secure: true` if using HTTPS
  })
);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", async (req, res) => {
  try {
    const aboutData = await About.findOne({});
    res.render("about", { aboutData: aboutData || {} });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/adminDashboard/about", async (req, res) => {
  console.log(req.body); // Check what data you're receiving
  const { title, descriptionOne, descriptionTwo } = req.body;

  const updateAbout = await About.findOneAndUpdate(
    {},
    { title, descriptionOne, descriptionTwo },
    { new: true, upsert: true }
  );
  if (updateAbout === null) {
    return;
  }
  return res.redirect("/about?status=success");
});

//edit about us page
app.get("/editabout/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const myabout = await About.findById(id);
    if (!myabout) {
      return res.status(404).send("About us page not found");
    }
    console.log("Data to render:", myabout); // Debugging: Log the data being sent
    res.render("editAbout", { myabout });
  } catch (error) {
    console.error("Error fetching about data:", error);
    res.status(500).send("Server error");
  }
});

//services
app.post("/services/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const service = await Services.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    if (!service) {
      return res.status(404).send("Service not found");
    }
    res.redirect("/services");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.get("/services", async function (req, res) {
  try {
    const aboutServices = await Services.find(); // Use find() to get all documents
    res.render("services", { aboutServices: aboutServices || [] }); // Pass the array of services to the view
  } catch (err) {
    res.status(500).send("server error");
  }
});

//edit services
app.get("/editservices/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const servicesData = await Services.findById(id);
    if (!servicesData) {
      return res.status(404).send("Service not found");
    }
    res.render("editServices", { servicesData });
  } catch (err) {
    res.status(500).send("server Error");
  }
});

//deleting services route
app.delete("/services/:id", async function (req, res) {
  const { id } = req.params;

  try {
    await Services.findByIdAndDelete(id);
    res.status(200).send();
  } catch (err) {
    res.status(500).send({ err: "Error while deleting Services" });
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next(); // User is authenticated, proceed to the next middleware/route
  }
  res.redirect("/login"); // Redirect to login if not authenticated
}

// Admin Dashboard

app.get("/adminDashboard", ensureAuthenticated, async (req, res) => {
  const contacts = await Contact.find({}).exec();
  const allList = await TeamMember.find({}).exec();
  const allServices = await Services.find({}).exec();
  const pricing = await Pricing.find({}).exec();
  const aboutData = await About.find({}).exec();
  res.render("adminDashboard", {
    contacts: contacts,
    allList: allList,
    allServices: allServices,
    pricing: pricing,
    aboutData: aboutData,
  });
});

app.get("/addteam", function (req, res) {
  res.render("addteam");
});

app.post(
  "/adminDashboard/team",
  upload.single("profilePic"),
  async (req, res) => {
    const { name, position, linkedin, instagram } = req.body;
    const profilePic = req.file ? "/uploads/" + req.file.filename : "";

    const newMember = new TeamMember({
      name,
      position,
      profilePic,
      linkedin,
      instagram,
    });

    try {
      await newMember.save();
      res.redirect("/team");
    } catch (err) {
      res.status(500).send("Server Error");
    }
  }
);

app.get("/team", async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    res.render("team", { teamMembers });
  } catch (err) {
    console.log(err);
  }
});

//delete team route
app.delete("/team/:id", async function (req, res) {
  const { id } = req.params;

  try {
    const result = await TeamMember.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send("Team member not found");
    }
    res.status(200).send("Team member delete successfully");
  } catch (err) {
    res.status(500).send("Error deleting Team");
  }
});

// Route to render edit form for a specific team member
app.get("/edit/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the team member by ID
    const member = await TeamMember.findById(id);
    if (!member) {
      return res.status(404).send("Team member not found");
    }

    // Render the edit page and pass the member data to it
    res.render("edit", { member });
  } catch (err) {
    res.status(500).send("Server error");
  }
});
//after edit for update
app.post("/team/update/:id", upload.single("profilePic"), async (req, res) => {
  const { id } = req.params;
  const { name, position, linkedin, instagram } = req.body;

  try {
    const profilePic = req.file
      ? "/uploads/" + req.file.filename
      : req.body.existingProfilePic;

    const updatedMember = await TeamMember.findByIdAndUpdate(
      id,
      {
        name,
        position,
        profilePic,
        linkedin,
        instagram,
      },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).send("Team member not found");
    }

    // Redirect back to the admin dashboard
    res.redirect("/adminDashboard");
  } catch (err) {
    res.status(500).send("Error updating team member");
  }
});

//pricing
app.post("/adminDashboard/pricing", async function (req, res) {
  const { planName, description, features, price, duration } = req.body;

  try {
    const newPlan = new Pricing({
      planName,
      description,
      features: features.split(","),
      price,
      duration,
    });
    await newPlan.save();
    res.redirect("/price");
  } catch (err) {
    console.log(err);
  }
});

app.get("/price", async function (req, res) {
  try {
    const allPricing = await Pricing.find(); // Use find() to get all documents
    res.render("price", { allPricing: allPricing || [] }); // Pass the array of services to the view
  } catch (err) {
    res.status(500).send("server error");
  }
});

//edit price
app.get("/adminDashboard/edit/:id", async function (req, res) {
  const { id } = req.params;
  try {
    const pricingPlan = await Pricing.findById(id);
    res.render("editPricing", { pricingPlan });
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
});
// update price
app.post("/adminDashboard/edit/:id", async function (req, res) {
  const { planName, description, features, price, duration } = req.body;

  try {
    const updatedPlan = {
      planName,
      description,
      features: features.split(",").map((feature) => feature.trim()), // Split and trim spaces
      price,
      duration,
    };

    await Pricing.findByIdAndUpdate(req.params.id, updatedPlan);
    res.redirect("/adminDashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
app.delete("/price/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Pricing.findByIdAndDelete(id);
    res.status(200).send({ message: "Pricing plan deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Error deleting pricing plan" });
  }
});

//contact us

app.get("/contact", function (req, res) {
  res.render("contactUs");
});

app.post("/contact", async function (req, res) {
  const { name, email, message } = req.body;

  try {
    const contact = new Contact({
      name,
      email,
      message,
    });

    await contact.save();
    res.status(200).send("Thank you for contacting us");
  } catch (err) {
    console.log(err);
  }
});

//delete contact route
app.delete("/contact/:id", async function (req, res) {
  const { id } = req.params;

  try {
    const result = await Contact.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send("Contact not found");
    }
    res.status(200).send("Contact deleted successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting contact");
  }
});

app.get("/price", function (req, res) {
  res.render("price");
});

// Routes
app.get("/login", (req, res) => {
  res.render("login"); // Render the EJS login view
});

app.post("/verifyLogin", (req, res) => {
  const { email, otp } = req.body;

  if (email === "regmiganesh87@gmail.com" && otp === "123456") {
    req.session.isAuthenticated = true; // Set session as authenticated
    return res.redirect("/adminDashboard");
  } else {
    res.status(401).send("Invalid Email or OTP");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login");
  });
});

app.listen(3000);

const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const About = require("./models/about.models");
const TeamMember = require("./models/ourteam.models");
const Services = require("./models/services.model");
const Contact = require("./models/contact.models");

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

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", async (req, res) => {
  try {
    const aboutData = await About.findOne();
    res.render("about", { aboutData });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

app.post("/adminDashboard/about", async (req, res, next) => {
  const { title, description } = req.body;

  const updateAbout = await About.findOneAndUpdate(
    {},
    { title, description },
    { new: true, upsert: true }
  );
  if (updateAbout === null) {
    return;
  }
  return res.redirect("/about?status=success");
});

//services
app.post("/services", async function (req, res) {
  const { name, description } = req.body;

  try {
    await Services.create({ name, description });
    res.redirect("services?status=success");
  } catch (error) {
    res.status(500).send("Error occur" + error.message);
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

// Admin Dashboard
app.get("/adminDashboard", async (req, res) => {
  const contacts = await Contact.find({}).exec();
  const allList = await TeamMember.find({}).exec();
  const allServices = await Services.find({}).exec();
  // console.log(contacts);
  res.render("adminDashboard", {
    contacts: contacts,
    allList: allList,
    allServices: allServices,
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

app.listen(4000);

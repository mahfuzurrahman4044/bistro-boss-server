const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.83ramik.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// console.log(process.env.DB_USER, process.env.DB_PASS);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    //     await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bistro Boss Restaurant");
});

const nodeMailer = require("nodemailer");

// console.log(process.env.Email, process.env.Pass);

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email,
    pass: process.env.Pass,
  },
});

app.post("/contactEmail", (req, res) => {
  const { userName, userEmail, subject, message } = req.body;

  const mailOptions = {
    to: "mahfuzurrahman4044@gmail.com",
    subject: subject,
    text: `Name: ${userName}\nFrom: ${userEmail}\n\n${message}`,
  };
  // console.log(mailOptions);

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: "Error sending email" });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});


const menusCollection = client.db("bistro-boss").collection("menus");
app.get("/menus", async (req, res) => {
  const result = await menusCollection.find().toArray();
  res.send(result);
});

const reviewsCollection = client.db("bistro-boss").collection("reviews")
app.get("/reviews", async (req, res) => {
  const result = await reviewsCollection.find().toArray();
  res.send(result)
})

const cartsCollection = client.db("bistro-boss").collection("carts")
app.post("/carts", async (req, res) => {
  const carts = req.body;
  console.log(carts);
  const result = await cartsCollection.insertOne(carts)
  res.send(result);
})

app.get("/carts", async (req, res) => {
  const result = await cartsCollection.find().toArray()
  res.send(result)
})

app.get("/carts/:email", async (req, res) => {
  const email = req.params.email;
  const result = await cartsCollection.find({ email: email }).toArray()
  res.send(result)
})

app.delete("/deleteCart/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  try {
    const result = await cartsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Item deleted successfully" });
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting item" });
  }
})

app.listen(port, () => {
  console.log(`Bistro Boss is running at ${port}`);
});

const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
var jwt = require('jsonwebtoken');
app.use(express.json());
app.use(cors());

const verifyJwt = (req, res, next) => {
  const authorization = req.headers.token;

  if (!authorization) {
    res.status(401).send({ error: true, message: "Unauthorized Access" })
  }

  const token = authorization.split(" ")[1]

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: true, message: "Forbidden Access" })
    }

    req.decoded = decoded;
    next()
  });
}

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

app.post("/jwt", (req, res) => {
  const user = req.body
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
  res.send({ token })
})

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
      // console.log("Email sent: " + info.response);
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
  // console.log(carts);
  const result = await cartsCollection.insertOne(carts)
  res.send(result);
})

app.get("/carts", verifyJwt, async (req, res) => {
  const result = await cartsCollection.find().toArray()
  res.send(result)
})

app.get("/carts/:email", async (req, res) => {
  const email = req.params.email;

  // const decodedEmail = req.decoded.email
  // if (email !== decodedEmail) {
  //   return res.status(403).send({ error: true, message: "Invalid Token" })
  // }

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

const usersCollection = client.db("bistro-boss").collection("users");
app.post("/users", async (req, res) => {
  const user = req.body;
  // console.log(user)

  const existingUser = await usersCollection.findOne({ email: user.email })
  if (existingUser) {
    return res.send({ message: "User already exist" })
  }

  const result = await usersCollection.insertOne(user)
  res.send(result)
})

app.get("/users", async (req, res) => {
  const users = await usersCollection.find().toArray()
  res.send(users)
})

app.get("/users/isAdmin/:email", async (req, res) => {
  const email = req.params.email

  // const decodedEmail = req.decoded.email
  // if (email !== decodedEmail) {
  //   return res.status(403).send({ error: true, message: "Invalid Admin" })
  // }

  const user = await usersCollection.findOne({ email: email })
  const result = { admin: user?.role === "admin" }
  res.send(result)
})

app.get("/users/isSeller/:email", async (req, res) => {
  const email = req.params.email

  // const decodedEmail = req.decoded.email
  // if (email !== decodedEmail) {
  //   return res.status(403).send({ error: true, message: "Invalid Admin" })
  // }

  const user = await usersCollection.findOne({ email: email })
  const result = { seller: user?.role === "seller" }
  res.send(result)
})

app.patch("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  const filtler = { _id: new ObjectId(id) }

  const updateDoc = {
    $set: {
      role: "admin"
    },
  };

  const result = await usersCollection.updateOne(filtler, updateDoc)
  res.send(result)
})

app.patch("/users/seller/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  const filtler = { _id: new ObjectId(id) }

  const updateDoc = {
    $set: {
      role: "seller"
    },
  };

  const result = await usersCollection.updateOne(filtler, updateDoc)
  res.send(result)
})

app.listen(port, () => {
  console.log(`Bistro Boss is running at ${port}`);
});

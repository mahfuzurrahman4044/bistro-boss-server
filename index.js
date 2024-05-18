const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require("mongodb");
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

app.listen(port, () => {
  console.log(`Bistro Boss is running at ${port}`);
});

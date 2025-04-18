const express = require("express");
const app = express();

const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctrkbrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("EquiSpots");
    const userCollection = database.collection("users");
    const equipmentCollection = database.collection("equipments");

    // User API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // Equipment API
    app.get("/equipments", async (req, res) => {
      const cursor = equipmentCollection.find();
      const equipments = await cursor.toArray();
      res.send(equipments);
    });

    app.post("/equipments", async (req, res) => {
      const equipment = req.body;
      const result = await equipmentCollection.insertOne(equipment);
      res.send(result);
    });

    app.delete("/equipments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/equipments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const equipment = await equipmentCollection.findOne(query);
      res.send(equipment);
    });

    app.put("/equipments/:id", async (req, res) => {
      const id = req.params.id;
      const equipment = req.body;    
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
    
      const updateDoc = {
        $set: {
          image: equipment?.image,
          itemName: equipment?.itemName,
          categoryName: equipment?.categoryName,
          description: equipment?.description,
          price: equipment?.price,
          rating: equipment?.rating,
          customization: equipment?.customization,
          processingTime: equipment?.processingTime,
          stockStatus: equipment?.stockStatus,
          
        },
      };
    
      // console.log("updateDoc", updateDoc);
    
      const result = await equipmentCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    

    // Fetch equipments by seller email
    app.get("/equipments/by-email/:email", async (req, res) => {
      const email = req.params.email;
      const query = { seller_email: email };
      const equipment = await equipmentCollection.find(query).toArray();
      res.send(equipment);
    });

    // Fetch equipments by category name
    app.get("/equipments/by-category/:category", async (req, res) => {
      const category = req.params.category;
      const query = { categoryName: category };
      const equipment = await equipmentCollection.find(query).toArray();
      res.send(equipment);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello Athletes!");
});

app.listen(port, () => {
  console.log(`Sport Equipment Server listening on port ${port}`);
});

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdilp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
      await client.connect();
      console.log("database connected!");
      const database = client.db('lifeLineDB');
      const doctorsCollection = database.collection('doctors');
      const servicesCollection = database.collection('services');
      const bookingServicesCollection = database.collection('bookingServices');

      //get doctors api
        app.get('/doctors', async(req,res)=>{
          const cursor = doctorsCollection.find({});
          const doctors = await cursor.toArray();
          res.send({doctors});
        });


        //get single doctor
        app.get('/doctors/:id', async (req,res)=>{
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await doctorsCollection.findOne(query);
           res.json(result);
        });

        //add single doctor
        app.post("/doctors", async (req, res) => {
          console.log(req.body);
          const result = await doctorsCollection.insertOne(req.body);
          res.json(result);
        });


        //get services api
        app.get('/services', async(req,res)=>{
          const cursor = servicesCollection.find({});
          const services = await cursor.toArray();
          res.send({services});
        });


        //get single service
        app.get('/services/:id', async (req,res)=>{
           const id = req.params.id;
           const query = {_id: ObjectId(id)};
           const result = await servicesCollection.findOne(query);
           res.json(result);
        });

        //add single service
        app.post("/services", async (req, res) => {
          console.log(req.body);
          const result = await servicesCollection.insertOne(req.body);
          res.json(result);
        });

         //booking services
         app.post("/bookingServices", async (req, res) => {
          console.log(req.body);
          const result = await bookingServicesCollection.insertOne(req.body);
          res.send(result);
        });

        //delete single booking
        app.delete('/bookingServices/:id', async (req,res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await bookingServicesCollection.deleteOne(query);
          res.json(result);
        });

        //get my booking
        app.get("/bookingServices/:email", async (req, res) => {
          const result = await bookingServicesCollection.find({
            email: req.params.email,
          }).toArray();
          res.send(result);
        });

        //get all bookings
        app.get("/bookingServices", async (req, res) => {
          const result = await bookingServicesCollection.find({}).toArray();
          res.send(result);
          console.log(result);
        });
    }
    finally{
        //await client.close();
   }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hospital server!!');
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
})
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const admin = require("firebase-admin");
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdilp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      console.log(token)
      try {
          const decodedUser = await admin.auth().verifyIdToken(token);
          req.decodedEmail = decodedUser.email;
      }
      catch {

      }

  }
  next();
}

async function run(){
    try{
      await client.connect();
      console.log("database connected!");
      const database = client.db('lifeLineDB');
      const doctorsCollection = database.collection('doctors');
      const appointmentsCollection = database.collection('appointments');
      const usersCollection = database.collection('users');

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

        //get appointments based on email & date
        app.get('/appointments', verifyToken, async (req, res) => {
          const email = req.query.email;
          const date = req.query.date;
          const query = { email: email, date: date }
          console.log(query)
          const cursor = appointmentsCollection.find(query);
          console.log(cursor)
          const appointments = await cursor.toArray();
          console.log(appointments)
          res.json(appointments);
      })

      //add an appointment
      app.post('/appointments', async (req, res) => {
          const appointment = req.body;
          const result = await appointmentsCollection.insertOne(appointment);
          res.json(result)
      });

      // find-out admin
      app.get('/users/:email', async (req, res) => {
          const email = req.params.email;
          const query = { email: email };
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if (user?.role === 'admin') {
              isAdmin = true;
          }
          res.json({ admin: isAdmin });
      })

      //add new user
      app.post('/users', async (req, res) => {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          console.log(result);
          res.json(result);
      });

      //update or insert new user/user
      app.put('/users', async (req, res) => {
          const user = req.body;
          const filter = { email: user.email };
          const options = { upsert: true };
          const updateDoc = { $set: user };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
      });

      //verify admin
      app.put('/users/admin', verifyToken, async (req, res) => {
          const user = req.body;
          const requester = req.decodedEmail;
          if (requester) {
              const requesterAccount = await usersCollection.findOne({ email: requester });
              if (requesterAccount.role === 'admin') {
                  const filter = { email: user.email };
                  const updateDoc = { $set: { role: 'admin' } };
                  const result = await usersCollection.updateOne(filter, updateDoc);
                  res.json(result);
              }
          }
          else {
              res.status(403).json({ message: 'you do not have access to make admin' })
          }

      })
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
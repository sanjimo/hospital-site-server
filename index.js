const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const {MongoClient} = require('mongodb');

const port = process.env.PORT || 5000

app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdilp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        console.log('database connected!');
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
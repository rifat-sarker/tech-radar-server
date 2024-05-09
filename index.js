const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const nodemailer = require("nodemailer");
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l80xyen.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db('productDB').collection('product')
    const mycartCollection = client.db('productDB').collection('mycart')

    app.get('/product', async(req,res)=> {
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/product/:id', async(req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await productCollection.findOne(query)
        res.send(result)
    })

    app.post('/product',async(req,res)=>{
        const newProduct = req.body;
        console.log(newProduct);
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
    })

    // add product to mycart
    app.get('/mycart', async(req,res)=> {
      const cursor = mycartCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/mycart',async(req,res)=>{
      const user = req.body;
      console.log(user);
      const result = await mycartCollection.insertOne(user);
      res.send(result);
    })

    app.post('/mycart/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productCollection.findOne(query)
      res.send(result)
    })

    // remove product from mycart
    app.delete('/mycart/:id', async(req,res)=> {
      const id = req.params.id;
      const query = { _id:(id)}
      const result = await mycartCollection.deleteOne(query)
      res.send(result)
    })

    app.put('/product/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updatedProduct = req.body;

      const product = {
        $set: {
          name: updatedProduct.name,
          brand: updatedProduct.brand,
          type : updatedProduct.type,
          price : updatedProduct.price,
          description : updatedProduct.description,
          rating : updatedProduct.rating,
          imageURL: updatedProduct.imageURL
        }
      }
      const result = await productCollection.updateOne(filter, product, options)
      res.send(result)
    } )

    // contact information
    // Email content
    app.post('/contact',(req,res)=> {
      const {name, email, message} = req.body;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL ,
          pass: process.env.PASSWORD
        }
      })

      // setup email data with unicode symbols
      const mailOptions = {
        from: "rifatswd@gmail.com",
        to: "rifatswd@gmail.com",
        subject: "You have received a new message from Tech Radar website",
        text: `Name:${name}\n Email:${email}\n Message:${message}`
      }

      // send mail with defined transport object
       transporter.sendMail(mailOptions,(error, info)=> {
        if(error){
          res.status(500).send("Error sending email")
        }
        else{
          console.log("Email sent successfully : " + info.response)
          res.status(200).send("Email sent successfully")
        }
      })

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send('tech radar running')
})

app.listen(port, ()=> {
    console.log(`tech radar server running on port, ${port}`);
})
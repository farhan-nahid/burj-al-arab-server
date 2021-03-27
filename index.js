const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const port = 5000


var serviceAccount = require("./burj-al-arob-0-firebase-adminsdk-cvzbc-ce9ee3474f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const app =express();
app.use(cors())
app.use(bodyParser.json())


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://burjalarab:arabian33@cluster0.2xoju.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");

  app.post('/addBooking', (req, res) =>{
      const newBooking = req.body;
      bookings.insertOne(newBooking)
      .then(result =>{
          res.send(result.insertedCount > 0);
      })
      console.log(newBooking);
  })
 
  app.get('/bookings', (req, res) =>{
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
        const idToken = bearer.split(' ')[1];
        console.log(idToken);
          admin
            .auth()
            .verifyIdToken(idToken)
            .then((decodedToken) => {
              const tokenEmail = decodedToken.email;
              if(tokenEmail === req.query.email){
                bookings.find({email: req.query.email})
                  .toArray((err, documents) =>{
                     res.send(documents)
               })
              }
              // ...
            })
            .catch((error) => {
              // Handle error
            });
    };

    // idToken comes from the client app



 
  })

});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)
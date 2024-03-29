const router = require("express").Router();

const car_details = require("../modules/car_details");
const police = require("../modules/police");
const police_data = require("../modules/police_data");
const user_data = require("../modules/user");

const accountSid = 'AC42adc57b1e7641bfa5209041f877ce96';
const authToken = '5a01b9256cb009d4c222b0893786159f';

const client = require('twilio')(accountSid, authToken);
var admin = require("firebase-admin");
var serviceAccount = require("../service.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-interceptor-d670e-default-rtdb.firebaseio.com/"
});

router.post("/police_officer", async (req, res) => {
  const newpolice = police_data({
    name: req.body.name,
    post: req.body.post,
    number: req.body.number,
    id: req.body.id,
    age: req.body.age,
    policestation: req.body.policestation,
  });
  try {
    const police_ = await newpolice.save();
    res.status(200).send({ police: police_ });
  } catch (error) {
    res.status(400).send({ success: false, msg: error });
  }
});

router.post("/get_police", async (req, res) => {
  try {
    const details = await police_data.findOne({ id: req.body.id });

    res.status(200).json(details);
  } catch (err) {
    res.status(500).json(err);
  }
});






//twitter nad twillio

router.post("/found_car", async (req, res) => {
  const filter = { car_number: req.body.car_number };
  const cursor = await user_data.findOne(filter);
  if (!cursor) {
    return res.status(404).send({
      success: false,
      message: "Car not found",
    });
  }
const userToken = cursor.user_token;
const notification = {
    title: "CAR SPOTTED!!!!",
    body: "We have spotted car at muradnagar NAKA",
  };
 
var topic = 'general';

var message = {
  notification: {
    title: "CAR SPOTTED!!!!",
    body: "We have spotted  car at muradnagar NAKA ",
  },
  topic: topic
};

// Send a message to devices subscribed to the provided topic.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
});
});




//sms
router.post("/found_car_msg", async (req, res) => {
  const filter = { car_number: req.body.car_number };

  const cursor = await user_data.findOne(filter);

  if (cursor) {

    // SMS
    client.messages
      .create({
        body: `Your car has been found at - ${cursor.place_of_missing}`,
        messagingServiceSid: 'MG7643cb3f1dbe45621f22f3ab8f493bdc',
        to: '+916397942636'
      })
      .then((message) => { })
      .done();

    // WHATSAPP
    client.messages 
      .create({ 
         body: `Your car has been found at - ${cursor.place_of_missing}`, 
         from: 'whatsapp:+14155238886',       
         to: 'whatsapp:+916397942636' 
       }) 
      .then(message => {}) 
      .done();
    
    res.status(200).send({ success: true, data: cursor })
  } else {
    res.status(200).send({ success: true, msg: "No Data Found" });
  }
  res.end();
})


//car_located


router.get("/frompython/:car_number", async (req, res) => {
  const cursor = await user_data.findOne({ car_number: req.params.car_number });

  if (cursor) {
    client.messages
      .create({
        body:  `Your car has been located at ${cursor.place_of_missing}`,
        messagingServiceSid: 'MG7643cb3f1dbe45621f22f3ab8f493bdc',
        to: '+916397942636'
      })
      .then(message => {})
      .done();

    client.messages
      .create({
        body: `Your car has been located at ${cursor.place_of_missing}`,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+916397942636'
      })
      .then(message => {})
      .done();
    console.log("yes");
    res.status(200).send({ success: true, data: cursor });
  } else {
    console.log("not");
    res.status(200).send({ success: true, msg: "No Data Found" });
  }
  const userToken = cursor.user_token;
  const notification = {
      title: "Your car has been found!",
      body: "We have found your missing car. Please contact the police station for more information.",
    };
  
  var topic = 'general';
  
  var message = {
    notification: {
      title: 'Your car has been found!',
      body: 'We have found your missing car. Please contact the police station for more information.'
    },
    topic: topic
  };
  
  // Send a message to devices subscribed to the provided topic.
  admin.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
  });
}); 


module.exports = router;

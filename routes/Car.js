const router = require("express").Router();
const { Timestamp } = require("mongodb");
const car_details = require("../modules/car_details");
const recoverd_car=require('../modules/recoverd_car')
const { TwitterApi } = require("twitter-api-v2");
const client = require("./config");

const Tweet = async (message) => {
  try {
    let text = message;
    const tweet = await client.v2.tweet({
      text,
    });
  } catch (error) {
    console.log(error);
  }
};



 
router.post("/save_Car", async (req, res) => {
    
  const risk="low"
  const newcar = car_details({
    car_Details: {
      car_number: req.body.car_Details.car_number,
      car_model: req.body.car_Details.car_model,
      engine_number: req.body.car_Details.engine_number,
      color: req.body.car_Details.color,
    },
    owner: {  
      name: req.body.owner.name,
      addres: req.body.owner.addres,
      phone: req.body.owner.phone,
    },
    missing_details: {
      car_number_: req.body.missing_details.car_number_,
      place: req.body.missing_details.place,
      police_station:req.body.missing_details.police_station,
      
    },
    risk:risk
  });

  try {
    const savedcar = await newcar.save();
    Tweet(`A ${req.body.car_Details.color} colored car with model ${req.body.car_Details.car_model} and number ${req.body.car_Details.car_number} is missing. It was last seen at ${req.body.missing_details.place}. If there is any clue, please contact ${req.body.owner.name} on phone ${req.body.owner.phone} and area ${req.body.missing_details.police_station}. \n\nDeveloped by @kartik_mehta8`);
    res.status(200).send({ car: savedcar });
  } catch (error) {
    res.status(400).send({ success: false, msg: error });
  }
});

//get car
router.get("/getcar/:id", async (req, res) => {
  const filter = { car_number: req.params.car_number };

  const cursor = await car_details.findOne(filter, { "car_Details": 1 ,"missing_details":1,"owner":1});

  if (cursor) {
    res.status(200).send({ success: true, data: cursor });
  } else {
    res.status(200).send({ success: false, msg: "No Data Found" });
  }
});


//getallcar
router.get("/getcars", async (req, res) => {
  const filter = { police_station: req.body.police_station_id };
  const cursor = await car_details.find(filter, { "missing_details": 1 });
  
  if (cursor) {
  res.status(200).send({ success: true, data: cursor });
  } else {
  res.status(200).send({ success: true, msg: "No Data Found" });
  }
  });

//update
router.put("/:id", async (req, res) => {
  try {
    const car = await car_details.findById(req.params.id);
    if (!car) {
      return res.status(404).send({ success: false, msg: "Car not found" });
    }

    let risk = "";
    if (car.risk === "low") {
      risk = "moderate";
    } else if (car.risk === "moderate") {
      risk = "high";
    }

    try {
      const update = await car_details.updateOne(
        { _id: req.params.id },
        { $set: { risk: risk } }
      );
      res.status(200).send({ success: true, msg: "Risk updated" });
    } catch (err) {
      res.status(500).send({ success: false, msg: err });
    }
  } catch (err) {
    res.status(500).send({ success: false, msg: err });
  }
});


//delte
router.delete("/delete/:id", async (req, res) => {
  try {
    const car = await car_details.findById(req.params.id);
    if (!car) return res.status(404).send({ success: false, msg: "CAR not found" });

    if (car.car_Details.car_number !== req.body.car_number) {
      return res.status(401).send({ success: false, msg: "Unauthorized to delete" });
    }

    const recovered_car = new recoverd_car({
      car_Details: {
        car_number: car.car_Details.car_number,
        car_model: car.car_Details.car_model,
        engine_number: car.car_Details.engine_number,
        color: car.car_Details.color,
      },
      owner: {
        name: car.owner.name,
        address: car.owner.address,
        phone: car.owner.phone,
      },
      missing_details: {
        place: car.missing_details.place || '',
        police_station: car.missing_details.police_station ||'',
        time: car.missing_details.time,
      },
    });

    try {
      await recovered_car.save();
    } catch (error) {
      return res.status(400).send({ success: false, msg: error.message });
    }

    await car.delete();
    res.status(200).send({ success: true, msg: "CAR deleted and saved in recovered_cars" });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});



module.exports = router;

const express = require("express");
const multer = require('multer')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("../project-shopping-cart/src/routes/route.js");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(multer().any())

mongoose.connect("mongodb+srv://21pintoo-singh:S0Uw8LhNlYRyHfiq@cluster1.k5nsu.mongodb.net/group51Database", { useNewUrlParser: true, })

  .then((result) => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));


app.use("/", route);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
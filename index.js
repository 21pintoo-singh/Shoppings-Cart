const express = require("express");
const multer = require('multer')
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const route = require("./src/routes/route");
const app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(multer().any())

mongoose.connect("mongodb+srv://21pintoo-singh:S0Uw8LhNlYRyHfiq@cluster1.k5nsu.mongodb.net/group51Database",{
      useNewUrlParser:true
}
)
.then((rerult)=>console.log("MongoDB is connected"))
.catch((err)=>console.log(err.message));

app.use("/" ,route);
app.listen(process.env.PORT || 3000 ,()=>{console.log("server is start on port"+ (process.env.PORT || 3000))})

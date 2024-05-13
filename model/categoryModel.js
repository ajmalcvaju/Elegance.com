const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  cname: {
    type: String,
    required: true,
    unique: true,
  },
  image:
  {type:String,
    required:true
},
Type:{type:String,
  required:true
},
is_deleted:
{type:Number,
  default:0},
  stock:{
    type:Number,
  default:0
  }
});

const Category = new mongoose.model("Category", categorySchema);

module.exports = Category;
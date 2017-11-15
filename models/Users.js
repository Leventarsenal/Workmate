const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Creating the schema
const UserSchema = new Schema({
  firstName:{
    type: String,
    required: true
  },
  surname:{
    type: String,
    required: true
  },
  company:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  mobile:{
    type: Number,
    required: true
  },
  address:{
    type: String,
    required: false
  },
  dob:{
    type: Date,
    required: false
  },
  position:{
    type: String,
    required: false
  },
  admin:{
    type: Boolean,
    required: false,
    default: true
  },
  scheduleManager:{
    type: Boolean,
    required: false,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('users', UserSchema);
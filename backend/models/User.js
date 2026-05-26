const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, minlength: 2 },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String, default: "" },
  address: {
    street:  { type: String, default: "" },
    city:    { type: String, default: "" },
    state:   { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "" },
  },
  resetPasswordToken:   String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

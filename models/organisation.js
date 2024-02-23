import mongoose from "mongoose";

const organisationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
});

export const Organisation = mongoose.model("Organisation", organisationSchema);

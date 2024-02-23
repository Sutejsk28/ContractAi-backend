import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, "Please enter key"],
  },
  value: {
    type: String,
    required: [true, "Please enter value"],
  },
});

export const Tag = mongoose.model("Tag", tagSchema);

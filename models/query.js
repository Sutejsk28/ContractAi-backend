import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please enter the question"],
  },
  answer: {
    type: String,
    required: [true, "Please enter the answer"],
  },
});

export const Query = mongoose.model("Query", querySchema);

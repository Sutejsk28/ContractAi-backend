import mongoose, { Mongoose } from "mongoose";

const contractSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  summary: {
    type: String,
    default: null,
  },
  pdfText: {
    type: String,
    default: null,
  },
  riskText: {
    type: String,
    default: null,
  },
  initiatedDate: {
    type: Date,
    required: true,
  },
  expireDate: {
    type: Date,
    required: true,
  },
  tags: [
    {
      key: {
        type: String,
        required: [true, "Please enter key"],
      },
      value: {
        type: String,
        required: [true, "Please enter value"],
      },
    },
  ],
  queries: [
    {
      question: {
        type: String,
        required: [true, "Please enter the question"],
      },
      answer: {
        type: String,
        required: [true, "Please enter the answer"],
      },
    },
  ],
  status: {
    type: String,
    enum: ["drafted", "inNegotiations", "approved"],
    default: "drafted",
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Contract = mongoose.model("Contract", contractSchema);

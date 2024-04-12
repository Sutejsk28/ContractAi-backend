import { asyncError } from "../middleware/error.js";
import { Contract } from "../models/contract.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import crypto from "crypto";
import moment from "moment";
import axios from "axios";
import FormData from "form-data";
import { getObjectURL, putObjectURL } from "../aws/s3.js";

export const getAllContractsByUser = asyncError(async (req, res, next) => {
  const userId = req.user._id;
  const contracts = await Contract.find({ userId });

  contracts.map(async (contract) => {
    if (contract.fileKey) {
      contract.fileUrl = await getObjectURL(contract.fileKey)
    }
  })

  res.status(200).json({
    success: true,
    message: `All the contracts of ${req.user.name}`,
    data: {
      contracts,
    },
  });
});

export const getContractById = asyncError(async (req, res, next) => {
  const num = req.params.num;
  const userId = req.user._id;
  const contracts = await Contract.find({
    contractNumber: num,
  });

  const contract = contracts[0];

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  if (contract.userId.toString() !== userId.toString()) {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  contract.fileUrl = await getObjectURL(contract.fileKey);

  res.status(200).json({
    success: true,
    message: `Contract with id: ${req.params.id}`,
    data: {
      contract,
    },
  });
});

export const createContract = asyncError(async (req, res, next) => {
  const { name, expireDate, initiatedDate } = req.body;


  const fileBuffer = req.file.buffer;
  const formData = new FormData();
  formData.append("file", fileBuffer, {
    filename: req.file.originalname,
    contentType: req.file.mimetype,
  });

  let summary = null;
  let pdfText = null;
  let riskText = null
  let tags = [];
  
  const id = name+req.user.name;
  const hash = crypto.createHash("sha256").update(id).digest("hex");
  const contractNumber = parseInt(hash.substring(0, 8), 16);
  const userId = req.user._id;

  console.log(contractNumber);

  const fileKey = await putObjectURL(req.file, contractNumber);

  const response = await axios.post(
    "http://127.0.0.1:8000/generate-contract-summary/",
    formData,
    {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
        accept: "application/json",
      },
    }
  );

  pdfText = response.data.pdf_text;
  summary = response.data.summary;
  riskText = response.data.analysis_text

  response.data.tags.map((ele, ind) => {
    tags.push({
      key: ele[0],
      value: ele[1],
    });
  });

  const contract = await Contract.create({
    name,
    contractNumber,
    summary,
    pdfText,
    tags,
    userId,
    riskText,
    fileKey,
    expireDate: new Date(expireDate),
    initiatedDate: new Date(initiatedDate),
  });

  return res.status(201).json({
    success: true,
    message: "Contract has been created",
    data: {
      contract,
    },
  });
});

export const getContractsByStatus = asyncError(async (req, res, next) => {
  const userId = req.user._id;
  const status = req.body.status;

  const contracts = await Contract.find({ userId, status });

  res.status(200).json({
    success: true,
    message: `All the contracts of ${req.user.name}`,
    data: {
      contracts,
    },
  });
});

export const changeStatus = asyncError(async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user._id;
  const { status } = req.body;

  const contract = await Contract.findById(id);

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  console.log(contract.userId, userId);

  if (contract.userId.toString() !== userId.toString()) {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  if (status) contract.status = status;

  await contract.save();

  res.status(200).json({
    success: true,
    message: `Contract with id: ${req.params.id}`,
    data: {
      contract,
    },
  });
});

export const getContractsAddedToday = asyncError(async (req, res, next) => {
  const userId = req.user._id;

  const startOfDay = moment().startOf("day").toDate();
  const endOfDay = moment().endOf("day").toDate();
  console.log(startOfDay, endOfDay);

  const contracts = await Contract.find({
    userId,
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });

  res.status(200).json({
    success: true,
    message: `All the contracts of ${req.user.name} added today`,
    data: {
      contracts,
    },
  });
});

export const getContractsExpiringSoon = asyncError(async (req, res, next) => {
  const currentDate = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

  const userId = req.user._id;

  const contracts = await Contract.find({
    userId,
    expireDate: {
      $gte: currentDate,
      $lte: thirtyDaysFromNow,
    },
  });

  res.status(200).json({
    success: true,
    message: `All the contracts of ${req.user.name} expiring soon`,
    data: {
      contracts,
    },
  });
});

export const getExpiredContracts = asyncError(async (req, res, next) => {
  const currentDate = new Date();

  const userId = req.user._id;

  const contracts = await Contract.find({
    userId,
    expireDate: {
      $lt: currentDate,
    },
  });

  res.status(200).json({
    success: true,
    message: `All the contracts of ${req.user.name} that have expired`,
    data: {
      contracts,
    },
  });
});

export const getDashboardData = asyncError(async (req, res, next) => {
  const currentDate = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

  const contractStatistics = await Contract.aggregate([
    {
      $match: {
        userId: req.user._id,
      },
    },
    {
      $group: {
        _id: null,
        draftedCount: {
          $sum: { $cond: [{ $eq: ["$status", "drafted"] }, 1, 0] },
        },
        inNegotiationsCount: {
          $sum: { $cond: [{ $eq: ["$status", "inNegotiations"] }, 1, 0] },
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        expiredCount: {
          $sum: { $cond: [{ $lt: ["$expireDate", currentDate] }, 1, 0] },
        },
        expiringSoonCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$expireDate", currentDate] },
                  { $lte: ["$expireDate", thirtyDaysFromNow] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalCount: { $sum: 1 },
      },
    },
  ]);

  const [statistics] = contractStatistics;

  res.status(200).json({
    success: true,
    message: `All the contracts of ${req.user.name} required for dashboard`,
    data: {
      ...statistics,
    },
  });
});

export const askQuery = asyncError(async (req, res, next) => {
  const query = req.body.query;

  const contract = await Contract.find({ contractNumber: req.params.num });

  if (!contract) {
    return new ErrorHandler("Contract with that number not found", 404);
  }

  const response = await axios.post(
    `http://127.0.0.1:8000/chat/?input_text=${query}&pdf_text=${contract[0].pdfText}`,
    {
      headers: { "Content-Type": "application/pdf" },
      withCredentials: true,
    }
  );

  contract[0].queries.push({
    question: query,
    answer: response.data.response_text,
  });

  await contract[0].save();

  res.status(200).json({
    success: true,
    message: `Answer to your query`,
    data: {
      answer: response.data.response_text,
    },
  });
});

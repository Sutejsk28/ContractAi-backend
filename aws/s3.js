import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
  import { s3Client } from "../config/aws.js";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import AppError from "../utils/ErrorHandler.js";
  import { config } from "dotenv";

config({ path: "./data/config.env" });

export const getObjectURL = async (key) => {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: process.env.BUCKET_NAME,
  });
  const url = await getSignedUrl(s3Client, command);
  return url;
};

export const putObjectURL = async (file, name) => {
  console.log(process.env.BUCKET_NAME);
  try {
    const destination = `uploads/contracts/${name}`;

    const uploadParams = {
      Bucket: process.env.BUCKET_NAME,
      Body: file.buffer,
      Key: destination,
      ContentType: file.mimetype,
    };
    await s3Client.send(new PutObjectCommand(uploadParams));
    return destination;
  } catch (error) {
    throw new AppError("Error uploading image", 500);
  }
};

export const deleteObject = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Key: key,
      Bucket: process.env.BUCKET_NAME,
    });
    await s3Client.send(command);
  } catch (error) {
    throw new AppError("Error deleting image", 500);
  }
};


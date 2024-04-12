import {S3Client} from '@aws-sdk/client-s3'
import { config } from "dotenv";

config({ path: "./data/config.env" });

export const s3Client = new S3Client({
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET || ""
    },
    region: process.env.BUCKET_REGION || ""
})

import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT!;
const webhook_secret = process.env.WEBHOOK_SECRET!;
const mongo_uri = process.env.MONGO_URI!;

export { port, webhook_secret, mongo_uri };
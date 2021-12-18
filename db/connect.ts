import mongoose from "mongoose";
import { mongo_uri } from "../keys";

main().catch(err => console.error(err));

async function main() {
	await mongoose.connect(mongo_uri);
};
import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
	site: String,
	url: String,
	title: String,
	image: {
		url: String,
		width: String,
		height: String
	},
	description: String
});

const Repo = mongoose.model('repos', repoSchema);

export default Repo;
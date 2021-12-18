import mongoose from "mongoose";

const repoSchema = new mongoose.Schema({
	site: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	desc: {
		type: String,
		required: true
	},
	image: {
		url: {
			type: String,
			required: true
		},
		width: {
			type: String,
			required: true
		},
		height: {
			type: String,
			required: true
		}
	},
	favicon: {
		type: String,
		required: true
	}
});

const Repo = mongoose.model('repos', repoSchema);

export default Repo;
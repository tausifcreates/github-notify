import ogs from "open-graph-scraper";

type Options = {
	url: string;
};

async function runOgs(options: Options) {
	const { error, result } = await ogs(options);
	console.log(error);
	console.log(result);
	return result;
}

export default runOgs;
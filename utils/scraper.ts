import ogs, { OpenGraphImage } from "open-graph-scraper";
import Repo from "../db/models/repo";

type OgsOptions = {
	url: string;
};

async function ogDataOps(options: OgsOptions) {
	try {
		const ogResult = await ogs(options);
		if (!ogResult.error) {
			const { result } = ogResult;
			/**
			 * `ogImage` is defined as `string|undefined` in `OpenGraphProperties`,
			 * but `OpenGraphImage|OpenGraphImage[]|undefined` in `SuccessResult`.
			 */
			let ogImg: string | OpenGraphImage = result.ogImage!;
			type ogImgPropsType = {
				url: string,
				width: string,
				height: string;
			};
			let ogImgProps: ogImgPropsType;
			/**
			 * As a workaround, check the type of `ogImg`. If it's an object,
			 * it gets rid of its' string type.
			 */
			if (typeof ogImg === "object") {
				ogImgProps = ogImg;
			} else {
				return {
					statusCode: 400,
					message: "No og image was sent."
				};
			}

			Repo.findOne({ 'site': result.ogUrl },
				async (error: Error, doc: Object) => {
					if (error) return {
						statusCode: 500,
						message: error
					};

					if (!doc) {
						const repoDoc = new Repo({
							site: result.ogSiteName,
							url: result.ogUrl,
							title: result.ogTitle,
							desc: result.ogDescription,
							image: {
								url: ogImgProps.url,
								width: ogImgProps.width,
								height: ogImgProps.height
							},
							favicon: result.favicon
						});

						try {
							await repoDoc.save();
						} catch (error) {
							return {
								statusCode: 500,
								message: result.error
							};
						}
					} else {
						/**
						 * Update logic goes here
						 */
					}
				});
		} else {
			const { result } = ogResult;
			return {
				statusCode: 500,
				message: result.error
			};
		}

		return { statusCode: 200, message: "Successful" };
	} catch (error) {
		return {
			statusCode: 500,
			message: error
		};
	}
}

export default ogDataOps
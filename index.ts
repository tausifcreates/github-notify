import crypto from "crypto";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import ogs, { OpenGraphImage, OpenGraphProperties } from "open-graph-scraper";
import { port, webhook_secret } from "./keys";
import("./db/connect");
import Repo from "./db/models/repo";

const app = express();

app.use(helmet());

app.use(morgan('dev'));

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.sendStatus(200);
});

app.post('/', (req, res) => {
	const headerSig = req.headers['x-hub-signature-256'];
	if (!headerSig) return res.sendStatus(401);
	const sig = Array.isArray(headerSig) ? headerSig[0] : headerSig;
	const hmac = crypto.createHmac('sha256', webhook_secret);
	const payload = JSON.stringify(req.body);
	const digest = "sha256=" + hmac.update(payload).digest('hex');

	(digest.length === sig.length) && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig)) ?
		(async () => {
			const isPrivate = req.body.repository.private;
			if (isPrivate) return res.sendStatus(405);
			const htmlUrl: string = req.body.repository.html_url;
			try {
				const ogResult = await ogs({ url: htmlUrl });
				if (!ogResult.error) {
					console.log("no error");
					const { result } = ogResult;
					let ogImg: string | OpenGraphImage = result.ogImage!;
					type ogImgPropsType = {
						url: string,
						width: string,
						height: string;
					};
					let ogImgProps: ogImgPropsType;
					if (typeof ogImg === "object") {
						ogImgProps = ogImg;
					} else {
						res.status(400).json({ message: "No og image was sent." });
					}

					Repo.findOne({ 'site': result.ogUrl },
						async (err: Error, qDoc: Object) => {
							if (err) return console.log(err);
							if (!qDoc) {
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
									console.error(error);
								}
							}
						});
				}
			} catch (error) {
				console.log("An error happened: ", error);
			}
			return res.sendStatus(200);
		})() : res.sendStatus(401);
});

app.listen(port, () => {
	console.log(`Listening at port ${port}`);
});
import crypto from "crypto";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import { port, webhook_secret } from "./keys";
import("./db/connect");
import runOgs from "./utils/scrapper";
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
			console.log(req.body.repository.private);
			try {
				const result = await runOgs({ url: htmlUrl });
				console.log("result: ", result);
			} catch (error) {
				console.log("An error happened: ", error);
			}
			return res.sendStatus(200);
		})() : res.sendStatus(401);
});

app.listen(port, () => {
	console.log(`Listening at port ${port}`);
});
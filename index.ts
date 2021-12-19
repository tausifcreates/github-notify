import crypto from "crypto";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import { port, webhook_secret } from "./keys";
import("./db/connect");
import ogDataOps from "./utils/scraper";

const app = express();

app.use(helmet());

app.use(morgan('dev'));

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.sendStatus(200);
});

app.post('/', async (req, res) => {
	const headerSig = req.headers['x-hub-signature-256'];
	if (!headerSig) return res.sendStatus(401);
	const sig = Array.isArray(headerSig) ? headerSig[0] : headerSig;
	const hmac = crypto.createHmac('sha256', webhook_secret);
	const payload = JSON.stringify(req.body);
	const digest = "sha256=" + hmac.update(payload).digest('hex');

	if (digest.length === sig.length && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig))) {
		const isPrivate = req.body.repository.private;
		if (isPrivate) return res.sendStatus(405);

		const htmlUrl: string = req.body.repository.html_url;
		try {
			const { statusCode, message } = await ogDataOps({ url: htmlUrl });
			res.status(statusCode).json({ message });
		} catch (error) {
			res.status(500).json({ message: error });
		}

	} else {
		res.sendStatus(401);
	};
});

app.listen(port, () => {
	console.log(`Listening at port ${port}`);
});
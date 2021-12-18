import crypto from "crypto";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

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
	const secret = process.env.WEBHOOK_SECRET!;
	const hmac = crypto.createHmac('sha256', secret);
	const payload = JSON.stringify(req.body);
	const digest = "sha256=" + hmac.update(payload).digest('hex');
	(digest.length === sig.length) && crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig)) ?
		res.sendStatus(200) : res.sendStatus(401);
});

const port = process.env.PORT!;

app.listen(port, () => {
	console.log(`Listening at port ${port}`);
});
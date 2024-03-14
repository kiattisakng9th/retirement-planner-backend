const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");
const bcrypt = require("bcrypt");
const fs = require("fs").promises;
require("dotenv").config();

functions.http("saveCalcData", async (req, res) => {
	const funcName = "saveCalcData";
	try {
		await authenticateReq(req.headers);
		const projectId = process.env.PROJECT_ID;
		const collectionId = process.env.COLLECTION_ID;

		// connect to Firestore
		const firestore = new Firestore({
			projectId,
		});
		const dbCollection = firestore.collection(collectionId);

		const {
			config_name,
			initial_fund,
			savings_per_month,
			saving_growth_percentage,
			retirement_age,
			monthly_expense,
			inflation_percentage,
			investment_return,
			retirement_return,
		} = req.body;

		const timestampInSeconds = ~~(new Date().getTime() / 1000);
		console.info(`[${funcName}] inserting ${config_name} data into db`);
		console.time(`[${funcName}] insertion time`);
		await dbCollection
			.add({
				config_name,
				initial_fund,
				savings_per_month,
				saving_growth_percentage,
				retirement_age,
				monthly_expense,
				inflation_percentage,
				investment_return,
				retirement_return,
				created_at: timestampInSeconds,
				updated_at: timestampInSeconds,
			})
			.then((docRef) => {
				console.debug(
					`[${funcName}] Document "${config_name}" written with ID: ${docRef.id}`
				);
				res.status(200).send({ message: "success", id: docRef.id });
			})
			.catch((error) => {
				console.error(`[${funcName}] Error adding document: `, error);
				res.status(500).send({ error, message: "Error adding document" });
			});
		console.timeEnd(`[${funcName}] insertion time`);
	} catch (error) {
		console.log(`[${funcName}] error: `, error.message);
		res.status(500).send({ message: error.message });
	}
});

/**
 * Authenticates a request based on the provided API key.
 * @param {Object} headers - The headers object containing the API key.
 * @returns {Promise<void>} - A Promise that resolves if authentication is successful.
 * @throws {Error} - Thrown if authentication fails.
 */
async function authenticateReq(headers) {
	const tagName = "authenticateReq";
	try {
		if (!headers || !headers["x-api-key"]) {
			throw new Error("Missing API key in headers");
		}

		const filePath = "./config/secrets.json";
		const apiKey = headers["x-api-key"];
		const jsonFile = await fs.readFile(filePath, { encoding: "utf8" });
		const { secret_key } = JSON.parse(jsonFile);
		const match = await bcrypt.compare(secret_key, apiKey);

		if (!match) {
			throw new Error("Unauthorized access");
		}
	} catch (error) {
		console.log(`[${tagName}] error:`, error);
		throw new Error("Unauthorized access");
	}
}

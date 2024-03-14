const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");
require("dotenv").config();

functions.http("saveCalcData", async (req, res) => {
	try {
		const funcName = "saveCalcData";
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

		const timestampInSeconds = new Date().getTime() / 1000;
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
		res.status(500).send({ error, message: "Error adding document" });
	}
});

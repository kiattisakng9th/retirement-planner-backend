const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");
require("dotenv").config();

functions.http("saveCalcData", async (req, res) => {
	try {
		console.info("inserting calculation data into db");
		// connect to Firestore
		const firestore = new Firestore({
			projectId: process.env.PROJECT_ID,
		});
		const dbCollection = firestore.collection("InputConfigs");

		await dbCollection
			.add({
				customer_name: "Cloud Functions 2",
			})
			.then((docRef) => {
				console.log(`Document written with ID: ${docRef.id}`);
			})
			.catch((error) => {
				console.error("Error adding document: ", error);
			});

		res.send("Data saved in Firestore!");
	} catch (error) {
		res.status(500).send("Error saving data: " + error);
	}
});

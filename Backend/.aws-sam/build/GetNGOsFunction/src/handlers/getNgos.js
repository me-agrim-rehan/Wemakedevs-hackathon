const { ScanCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../services/dynamodb");

exports.handler = async () => {
    try {
        const result = await db.send(
            new ScanCommand({
                TableName: "disaster-response-ngos"
            })
        );

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items || [])
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Failed to fetch NGOs"
            })
        };
    }
};
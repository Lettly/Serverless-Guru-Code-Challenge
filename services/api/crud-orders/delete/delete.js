"use strict";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)


export async function handler(event) {
    const { body } = event;
    //create an order for a coffey shop
    const { costumerId, date } = JSON.parse(body);
    if (!costumerId || !date) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Missing parameters",
                description: "You must provide a costumerId and a date"
            }),
        };
    }

    try {
        //remove the order from the database
        const command = new DeleteCommand({
            TableName: process.env.ORDERS_TABLE,
            Key: {
                costumerId,
                date,
            },
        });

        await doc.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                order: {
                    costumerId,
                    date,
                }
            }),
        };
    } catch (error) {
        return {
            statusCode: 503,
            body: JSON.stringify({
                error: error,
                description: "Error removing the order from the database"
            }),
        };
    }
}
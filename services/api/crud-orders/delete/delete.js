"use strict";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)


export async function handler(event) {
    const { body } = event;
    //create an order for a coffey shop
    const { customerId, date } = JSON.parse(body);
    if (!customerId || !date) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Missing parameters",
                description: "You must provide a customerId and a date"
            }),
        };
    }

    try {
        //remove the order from the database
        const command = new DeleteCommand({
            TableName: process.env.ORDERS_TABLE,
            Key: {
                customerId,
                date,
            },
        });

        await doc.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                order: {
                    customerId,
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
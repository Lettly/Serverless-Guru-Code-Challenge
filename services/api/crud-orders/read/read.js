"use strict";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)

export async function handler(event) {
    console.log("event", event);
    const { customerId, date } = event.pathParameters

    try {
        if (!customerId || !date) {
            const orders = await scanDB()

            return {
                statusCode: 200,
                body: JSON.stringify({
                    orders: orders.Items
                }),
            };

        }

        //Get the order from the database
        const command = new GetCommand({
            TableName: process.env.ORDERS_TABLE,
            Key: {
                customerId,
                date,
            }
        });

        const order = await doc.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                order: order.Item
            }),
        };
    } catch (error) {
        return {
            statusCode: 503,
            body: JSON.stringify({
                error: error,
                description: "Error getting the order from the database"
            }),
        };
    }
}

async function scanDB(ExclusiveStartKey) {
    const command = new ScanCommand({
        TableName: process.env.ORDERS_TABLE,
        ExclusiveStartKey: ExclusiveStartKey,
    });

    const result = await doc.send(command);
    return result;
}


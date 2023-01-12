"use strict";
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)

export async function handler(event) {
    const { body } = event;
    const { customerId, date, exclusiveStartKey } = JSON.parse(body);

    try {
        if (!customerId || !date) {
            const orders = await scanDB(exclusiveStartKey)

            return {
                statusCode: 200,
                body: JSON.stringify({
                    orders: orders
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
                order: order
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


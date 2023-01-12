"use strict";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)

export async function handler(event) {
    const { body } = event;
    const { costumerId, date, exclusiveStartKey } = JSON.parse(body);

    try {
        if (!costumerId || !date) {
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
                costumerId,
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


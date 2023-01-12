"use strict";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)

export async function handler(event) {
    console.log("event", event);

    try {
        //Get the order from the database using a query 
        const command = new QueryCommand({
            TableName: process.env.ORDERS_TABLE,
            KeyConditionExpression: "#status = :status",
            IndexName: "byStatusDate",
            ScanIndexForward: true,
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": "pending"
            }
        });

        const orders = await doc.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                orders: orders.Items
            }),
        };
    } catch (error) {
        return {
            statusCode: 503,
            body: JSON.stringify({
                error: error,
                description: "Error getting the orders from the database"
            }),
        };
    }
}
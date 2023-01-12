"use strict";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)

export async function handler(event) {
    const { body } = event;
    //update an order for a coffey shop
    const { costumerId, item, quantity, status } = JSON.parse(body);
    if (!costumerId || !item) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Missing parameters",
                description: "You must provide a costumerId, an item and a quantity"
            }),
        };
    }
    if (status !== "pending" && status !== "ready" && status !== "delivered") {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Invalid status",
                description: "The status must be pending, ready or delivered"
            }),
        };
    }

    const order = {
        item,
        quantity,
        status,
    }

    try {
        //generate the update expression
        const updateExpression = Object.keys(order).map((key) => `${key} = :${key}`).join(', ');
        const expressionAttributeValues = Object.keys(order).reduce((acc, key) => {
            acc[`:${key}`] = order[key];
            return acc;
        }, {});

        const command = new UpdateCommand({
            TableName: process.env.ORDERS_TABLE,
            Key: {
                costumerId: costumerId,
                date: date,
            },
            UpdateExpression: `set ${updateExpression}`,
            ExpressionAttributeValues: expressionAttributeValues,
        });
        await doc.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                order: { ...order, costumerId, date },
            }),
        };
    } catch (error) {
        return {
            statusCode: 503,
            body: JSON.stringify({
                error: error,
                description: "Error updating the order in the database"
            }),
        };
    }
}
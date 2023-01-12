"use strict";
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, ScanCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient();
const doc = DynamoDBDocumentClient.from(client)


export async function handler(event) {
    const { body } = event;
    //create an order for a coffey shop
    const { costumerId, item, quantity } = JSON.parse(body);
    if (!costumerId || !item || !quantity) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "Missing parameters",
                description: "You must provide a costumerId, an item and a quantity"
            }),
        };
    }

    const order = {
        costumerId,
        date: new Date().toISOString(),
        item,
        quantity,
        status: "pending",
    }

    try {
        //save the order in the database
        const command = new PutCommand({
            TableName: process.env.ORDERS_TABLE,
            Item: order,
        });
        await doc.send(command);

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
                description: "Error saving the order in the database"
            }),
        };
    }
}
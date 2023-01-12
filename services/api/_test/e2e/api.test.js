require('dotenv').config()
import axios from 'axios'
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: process.env.Region });
const doc = DynamoDBDocumentClient.from(client)


async function checkDbEntry(customerId, date) {
    const command = new GetCommand({
        TableName: process.env.OrdersTable,
        Key: {
            customerId,
            date,
        }
    });

    const order = await doc.send(command);
    return order?.Item;
}

describe("A call to the api can", () => {
    test('create an order', async () => {
        const order = {
            "customerId": "marco",
            "item": 1,
            "quantity": 1,
        }

        const res = await axios.post(`${process.env.HttpApiUrl}/orders`, order).catch(
            (err) => {
                console.log(err.response.data);
                throw err
            }
        )

        expect(res.status).toBe(200)
        expect(res.data.order).toEqual({
            ...order,
            date: expect.any(String),
            status: "pending",
        })

        const dbEntry = await checkDbEntry(res.data.order.customerId, res.data.order.date)
        expect(dbEntry).toEqual(res.data.order)
    })
})
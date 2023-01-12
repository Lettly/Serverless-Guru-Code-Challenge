require('dotenv').config()
import axios from 'axios'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
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

async function createDbEntry(customerId, date) {
    const order = {
        customerId,
        date,
        item: 1,
        quantity: 1,
        status: "pending",
    }

    const command = new PutCommand({
        TableName: process.env.OrdersTable,
        Item: order,
    });

    await doc.send(command);
    return order;
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

    test('get an order', async () => {
        const order = await createDbEntry("marco", "2021-01-01T00:00:00.000Z")

        const res = await axios.get(`${process.env.HttpApiUrl}/orders/${order.customerId}/${order.date}`).catch(
            (err) => {
                console.log(err.response.data);
                throw err
            }
        )

        expect(res.status).toBe(200)
        expect(res.data.order).toEqual(order)

        const dbEntry = await checkDbEntry(res.data.order.customerId, res.data.order.date)
        expect(dbEntry).toEqual(res.data.order)
    })

    test('get the orders pending in a asc order', async () => {
        await createDbEntry("marco", "2021-02-01T00:00:00.000Z")
        await createDbEntry("marco", "2021-02-02T00:00:00.000Z")

        const res = await axios.get(`${process.env.HttpApiUrl}/orders`).catch(
            (err) => {
                console.log(err.response.data);
                throw err
            }
        )

        expect(res.status).toBe(200)
        expect(res.data.orders).toEqual(
            expect.arrayContaining([
                expect.objectContaining(
                    {
                        customerId: expect.any(String),
                        date: expect.any(String),
                    }
                )
            ])
        )
    })

    test('edit an order', async () => {
        const order = await createDbEntry("marco", "2021-01-02T00:00:00.000Z")
        order.status = "delivered"

        const res = await axios.put(`${process.env.HttpApiUrl}/orders`, order).catch(
            (err) => {
                console.log(err.response.data);
                throw err
            }
        )

        expect(res.status).toBe(200)
        expect(res.data.order).toEqual(order)

        const dbEntry = await checkDbEntry(res.data.order.customerId, res.data.order.date)
        expect(dbEntry).toEqual(res.data.order)
    })

    test('delete an order', async () => {
        const order = await createDbEntry("marco", "2021-01-03T00:00:00.000Z")

        const res = await axios.delete(`${process.env.HttpApiUrl}/orders/${order.customerId}/${order.date}`).catch(
            (err) => {
                console.log(err.response.data);
                throw err
            }
        )

        expect(res.status).toBe(200)
        expect(res.data.order).toEqual({
            customerId: order.customerId,
            date: order.date,
        })

        const dbEntry = await checkDbEntry(res.data.order.customerId, res.data.order.date)
        expect(dbEntry).toEqual(undefined)
    })
})
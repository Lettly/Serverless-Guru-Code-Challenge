# AWS API Gateway CRUD REST API

## The Challenge

Build a Serverless Framework REST API with AWS API Gateway which supports CRUD functionality (Create, Read, Update, Delete) *don't use service proxy integration directly to DynamoDB from API Gateway

Please use GitHub Actions CI/CD pipeline, AWS CodePipeline, or Serverless Pro CI/CD to handle deployments.

You can take screenshots of the CI/CD setup and include them in the README.

The CI/CD should trigger a deployment based on a git push to the master branch which goes through and deploys the backend Serverless Framework REST API and any other resources e.g. DynamoDB Table(s).

### Requirements

0. All application code must be written using NodeJS, Typescript is acceptable as well

1. All AWS Infrastructure needs to be automated with IAC using [Serverless Framework](https://www.serverless.com)

2. The API Gateway REST API should store data in DynamoDB

3. There should be 4-5 lambdas that include the following CRUD functionality (Create, Read, Update, Delete) *don't use service proxy integration directly to DynamoDB from API Gateway

3. Build the CI/CD pipeline to support multi-stage deployments e.g. dev, prod

4. The template should be fully working and documented

4. A public GitHub repository must be shared with frequent commits

5. A video should be recorded (www.loom.com) of you talking over the application code, IAC, and any additional areas you want to highlight in your solution to demonstrate additional skills

Please spend only what you consider a reasonable amount of time for this.

## Optionally

Please feel free to include any of the following to show additional experience:

1. Make the project fit a specific business case e.g. Coffee Shop APIs vs Notes CRUD directly from AWS docs
2. AWS Lambda packaging
3. Organization of YAML files
4. Bash/other scripts to support deployment
5. Unit tests, integration tests, etc

<br>

---
# Coffee Shop APIs
I chose to create a coffee shop api to to pay homage to [serverlesspresso](https://workshop.serverlesscoffee.com/) 

## Infrastructure 
The infrastructure is very simple consist on 2 different stack one for the resource and one for the service. With this approach we can have a better control of the deploy.

![infrastructure](/ServerlessGuru%20CC.drawio.png)
> Diagram of the infrastructure

## Resource
Inside the resource stack I created the DynamoDB table to store the orders from the coffe shop. 
The table has the following structure:

| Key | Type | Notes | KeyType | 
| --- | --- | --- | --- |
| customerId | String | The id of the customer | HASH |
| date | String | The date of the order | RANGE |
| item | String | The item ordered | |
| quantity | Number | The quantity of the item ordered | |
| status | String | The status of the order (can be: pending, ready or delivered) | |

The table has a global secondary index to query the orders by status and date. 
The index has the following structure:
| Key  | KeyType |
| --- | --- |
| status | HASH |
| date | RANGE |

## Service
Inside the service stack I created the API Gateway and the lambda functions.
The API Gateway has the following endpoints:

| Method | Path | Notes | Body Parameters |
| --- | --- | --- | --- | 
| GET | /orders | Get all the orders pending asc | |
| GET | /orders/{customerId}/{date} | Get the order by customerId and date | |
| POST | /orders | Create a new order | **customerId**, item, quantity |
| PUT | /orders | Update the order by customerId and date | **customerId**, **date**, item, quantity, status |
| DELETE | /orders/{customerId}/{date} | Delete the order by customerId and date |

> Parameters with **bold** are required. For a description of every parameters please refer to [the table structure inside the Resource](##Resource)

## Test
For the test I used [Jest](https://jestjs.io/). I created E2E test for the service. if I had more time I would have done the unit tests and the integration test. But given the fact that I had to chose, I chose to do the E2E test, because are more complete and give me more confidence that the service is working as expected.

## CI/CD
For the continuous deployment I used [GitHub Actions](https://github.com/features/actions). I created a workflow that will deploy all the resource and service, with the stage equal to the branch name, on every push to a branch.
The steps are the following:
1. Checkout the code
2. Install NodeJS
3. Install Serverless Framework
4. Install the dependencies
5. Deploy the resource and service
6. Run the E2E test




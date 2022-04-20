const AWS = require('aws-sdk');
const { count } = require('console');

const awsRegion = ( "ap-south-1" );//"localhost"
const TABLE_NAME = "counters";
class CounterService {
	constructor() {
        this.docClient = new AWS.DynamoDB.DocumentClient( { region: awsRegion } );
	}


 async getCounter(){

    try{
        let data = await this.docClient.get({
            "TableName": TABLE_NAME,
            "Key": {
              "counterName": "importantCounter"
            },
            "ConsistentRead": true
          }).promise()

          const currentValue = data.Item.currentValue;
          const newValue = currentValue + 1;
          data = await this.docClient.update({
            "TableName": "counters",
            "ReturnValues": "UPDATED_NEW",
            "ExpressionAttributeValues": {
              ":a": currentValue,
              ":bb": newValue
            },
            "ExpressionAttributeNames": {
              "#currentValue": "currentValue"
            },
            "ConditionExpression": "(#currentValue = :a)",
            "UpdateExpression": "SET #currentValue = :bb",
            "Key": {
              "counterName": "importantCounter"
            }
        }).promise()
        let count = data.Attributes.currentValue
        return count.toString()
    }catch(error){
        console.log(error)
    }
    return 0
 }  
} 
module.exports = CounterService;
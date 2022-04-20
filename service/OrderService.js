var AWS = require( "aws-sdk" );
const awsRegion = ( "ap-south-1" );//"localhost"
const TABLE_NAME = "Order";

class OrderService {
	constructor( ) {
		this.docClient = new AWS.DynamoDB.DocumentClient( { region: awsRegion } );
	}

	async orderitem( orderRequest ) {
		try {
			console.log( "OrderService: orderitem Start" );
			var params = {
				TableName: TABLE_NAME,
				Item: orderRequest
			};
			let response = await this.docClient.put(  JSON.parse( JSON.stringify( params ) )  ).promise();
			let resp = {"Success": true, Message: "Product has been Ordered!", Data: response.Item, "error": {}};
			console.log( "OrderService: orderitem End" );
			return resp;
		} catch ( error ) {
			console.log( `OrderService: error occured while adding order item - ${error}` );
			throw error;
		}
	}

	async getordereditems( email ) {
		try {
			console.log( "OrderService: getordereditems Start", email );
			let params = {
				TableName: TABLE_NAME,
				FilterExpression: "#key = :value",
				ExpressionAttributeNames: {
					"#key": "supplier_email",
				},
				ExpressionAttributeValues: {
					":value": email,
				}
			};
			let response = await this.docClient.scan(  JSON.parse( JSON.stringify( params ) )  ).promise();
			console.log(response);
			let resp = {Success: true, Message: "List of Ordered Items!", Data: response.Items, "error": {}};				
			console.log( "OrderService: getordereditems End" );
			return resp;
		} catch ( error ) {
			console.log( `OrderService: getordereditems error occurred: ${error.stack}` );
			throw error;
		}
	}
}

module.exports = OrderService;
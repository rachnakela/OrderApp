var AWS = require( "aws-sdk" );
const CounterService = require('./CounterService');

const awsRegion = ( process.env.AWS_DEFAULT_REGION || "ap-south-1" );//"localhost"
const TABLE_NAME = "Product";
class ProductService {
	constructor( ) {
        
        this.docClient = new AWS.DynamoDB.DocumentClient( { region: awsRegion } );
	}

	async add( productRequest ) {
        let counter;
        let counterService = new CounterService();
        if(productRequest.item_id == undefined){
            counter = await counterService.getCounter()
            productRequest.item_id = counter
        }else {
            counter = productRequest.item_id
        }
        
        var params = {
            TableName: TABLE_NAME,
            Item:productRequest
        };
		try {
			console.log( "ProductService: add Start" );
            let response = await this.docClient.put(  JSON.parse( JSON.stringify( params ) )  ).promise();

            var params = {
                TableName: TABLE_NAME,
                Key:{item_id:counter}
            };
             response = await this.docClient.get(  JSON.parse( JSON.stringify( params ) )  ).promise();

            console.log(response)
			console.log( "ProductService: add End" );

            let resp = {Success: true, Message: "New Product has been Published!", Data: response.Item, "error": {}}
			return resp;

		} catch ( error ) {
			console.log( `ProductService: add error occurred: ${error.stack}` );
			throw error;
		}
	}
    async delete( email, item_id ) {
		try {
			console.log( "ProductService: delete Start" );
            //to do validations
            var params = {
                TableName: TABLE_NAME,
                Key:{item_id: item_id}
            };
            let response = await this.docClient.delete(  JSON.parse( JSON.stringify( params ) )  ).promise();
            console.log( "ProductService: delete End" );
			let resp = {"Success": true, "Message": "Product has been deleted!", "error": {}}
            return resp;
		} catch ( error ) {
			console.log( `ProductService: delete error occurred: ${error.stack}` );
			throw error;
		}
	}

    async getAll( email,tab ) {
		try {
			console.log( "ProductService: getAll Start" );
            let params,message=""
            if( tab == "market"){
                params = {
                    TableName: TABLE_NAME,
                    FilterExpression: "#email = :email",
                    ExpressionAttributeNames: {
                        "#email": "supplier_email",
                    },
                    ExpressionAttributeValues: {
                        ":email": email,
                    }
                 };
                 message =  `List of Products Published by ${email}`


            }else{
                params = {
                    TableName: TABLE_NAME,
                    FilterExpression: "#email <> :email",
                    ExpressionAttributeNames: {
                        "#email": "supplier_email",
                    },
                    ExpressionAttributeValues: {
                        ":email": email,
                    }
                 };
                 message = "List of Products available in the market."
            }
            
            let response = await this.docClient.scan(  JSON.parse( JSON.stringify( params ) )  ).promise();
			console.log( "ProductService: getAll End" );
            return {Success: true, Message: message, Data: response.Items, "error": {}}

		} catch ( error ) {
			console.log( `ProductService: getAll error occurred: ${error.stack}` );
			throw error;
		}
	}
	
}

module.exports = ProductService;
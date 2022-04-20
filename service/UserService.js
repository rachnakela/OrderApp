var AWS = require( "aws-sdk" );
const bcrypt = require('bcryptjs');

const awsRegion = ( process.env.AWS_DEFAULT_REGION || "ap-south-1" );//"localhost"
const TABLE_NAME = "User";

class UserService {
	constructor( ) {
        this.docClient = new AWS.DynamoDB.DocumentClient( { region: awsRegion } );
	}

	async register( userRequest ) {
		try {
			console.log( "UserService: register Start" );

            let isUserExist = await this.isUserExist(userRequest.email);
			if (isUserExist) {
				let resp = {"Success": false, "Message": "User already exists!", "error": {}};
				console.log( "UserService: register End" );
				return resp;
			}
            // hash password
            let password = bcrypt.hashSync(userRequest.pwd, 10);
            userRequest.pwd = password

            var params = {
                TableName: TABLE_NAME,
                Item:userRequest
            };
            try {
                
                await this.docClient.put(  JSON.parse( JSON.stringify( params ) )  ).promise();
                console.log( "UserService: register End" );
    
            } catch ( error ) {
                console.log( `error occured while adding user - ${error}` );
                console.log( "user: Error: " );
                this.handleError( error );
                throw error
            }
            let resp = {Success: true, Message: "User entry has been added!", "error": {}}
            return resp
		} catch ( error ) {
			console.log( `UserService: register error occurred: ${error}` );
			throw error;
		}
	}

	async login( email,pwd ) {
		try {
			console.log( "UserService: login Start" );

            var params = {
                TableName: TABLE_NAME,
                Key:{email:email}
            };
            let resp = await this.docClient.get(  JSON.parse( JSON.stringify( params ) )  ).promise();

            if ( resp.Item == undefined ) {
                resp = {"Success": true, "Message": "User does not exits!", "error": {}}
            }else if(resp.Item != undefined  && !bcrypt.compareSync(pwd, resp.Item.pwd) ){
                resp = {"Success": true, "Message": "Incorrect Password!", "error": {}}
            }else{
                resp = {"Success": true, "Message": "User has been Authenticated!", "error": {}}
            }

            console.log( "UserService: login End" );
			return resp;
		} catch ( error ) {
			console.log( `UserService: register error occurred: ${error.stack}` );
			throw error;
		}
	}

    async isUserExist(email)
 {
		try{			
			console.log( "UserService: isUserExist Start" );
			var params = {
				TableName: TABLE_NAME,
				Key:{email:email}
			};
			let resp = await this.docClient.get(  JSON.parse( JSON.stringify( params ) )  ).promise();
			
			if ( resp.Item!=undefined && email === resp.Item.email) {				
				console.log( "UserService: isUserExist End" );
				return true;
			}else{				
				console.log( "UserService: isUserExist End" );
				return false;
			}			
		} catch ( error ) {
			console.log( `UserService: isUserExist error occurred: ${error.stack}` );
			throw error;
		}
	}

    // Handles errors during PutItem execution. Use recommendations in error messages below to 
	// add error handling specific to your application use-case. 
	handleError( err ) {
		if ( !err ) {
			console.error( "Encountered error object was empty" );
			return;
		}
		if ( !err.code ) {
			console.error( `An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify( err )}` );
		}
		switch ( err.code ) {
		case "ConditionalCheckFailedException":
			console.error( `Condition check specified in the operation failed, review and update the condition check before retrying. Error: ${err.message}` );
			break;
		case "TransactionConflictException":
			console.error( `Operation was rejected because there is an ongoing transaction for the item, generally safe to retry ' +
         'with exponential back-off. Error: ${err.message}` );
			break;
		case "ItemCollectionSizeLimitExceededException":
			console.error( "An item collection is too large, you're using Local Secondary Index and exceeded size limit of" + 
          `items per partition key. Consider using Global Secondary Index instead. Error: ${err.message}` );
			break;
		default:
			break;
      // Common DynamoDB API errors are handled below
		}
		this.handleCommonErrors( err );
	}
  
	handleCommonErrors( err ) {
		switch ( err.code ) {
		case "InternalServerError":
			console.error( `Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}` );
			break;
		case "ProvisionedThroughputExceededException":
			console.error( "Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off." 
          + `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}` );
			break;
		case "ResourceNotFoundException":
			console.error( `One of the tables was not found, verify table exists before retrying. Error: ${err.message}` );
			break;
		case "ServiceUnavailable":
			console.error( `Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}` );
			break;      
		case "ThrottlingException":
			console.error( `Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}` );
			break;
		case "UnrecognizedClientException":
			console.error( "The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying." 
          + `Error: ${err.message}` );
			break;
		case "ValidationException":
			console.error( "The input fails to satisfy the constraints specified by DynamoDB, "
          + `fix input before retrying. Error: ${err.message}` );
			break;
		case "RequestLimitExceeded":
			console.error( "Throughput exceeds the current throughput limit for your account, "
          + `increase account level throughput before retrying. Error: ${err.message}` );
			break;
		default:
			console.error( `An exception occurred, investigate and configure retry strategy. Error: ${err.message}` );
			break;
		}
		throw err.code;
	}

	
}

module.exports = UserService;
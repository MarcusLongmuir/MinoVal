var logger = require('tracer').console()

module.exports = function(mino, callback) {
	mino.api.call({username:"TestUser"},{
		"function": "save_type",
		parameters:{
			type: {
				name: 'user',
				display_name: 'User',
				type: 'object',
				fields: [
					{
		            	name: "id",
		        		display_name: "id",
		        		type: "number"
		        	},{
		            	name: "first_name",
		        		display_name: "First name",
		        		type: "text",
		        		min_length: 2
		        	},{
		            	name: "last_name",
		        		display_name: "Last name",
		        		type: "text",
		        		min_length: 2
		        	},{
		        		name: "Address",
		        		display_name: "Address",
		        		type: "text",
		        		min_length: 2
		        	},{
		        		name: "company_id",
		        		display_name: "Company id",
		        		type: "number",
		        	}
				]
			}
		}
	},function(err,res){
		logger.log(JSON.stringify(err,null,4));
		callback(err,res)		
	})
}
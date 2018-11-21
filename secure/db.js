
 

function findData(modal,object){

	return new Promise(function(resolve,reject){

		modal.findOne(object,(err,data) => {
			if(err)  reject(err);
			if(data) resolve(data);
			return resolve();
		});

	});
	
}

function findAll(modal,object){

    return new Promise(function(resolve,reject){

        modal.find(object,(err,data) => {
            if(err)  reject(err);
            if(data) resolve(data);
            return resolve();
        });

    });

}

module.exports.findData = findData;
module.exports.findAll = findAll;
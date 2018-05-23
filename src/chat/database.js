import idb from 'idb'; 
import Events from 'events';

class Database {
    constructor() {
        /*
        each requested database action is put into the queue, executing in the order received
        the exception would be storing data - if storing data, it could go through the queue
        to store the rest of the data for the current object store, removing each from the 
        queue once complete
        */
        this.dataQueue = []; 

        /*
        given the action (create/get/add/load), the function will
        add the request to this.dataQueue, calling the appropriate
        method when reached
        functionality:
            create object store
            get object store data
            add data to object store
            load data from object store
        */
       this.addToQueue = this.addToQueue.bind(this);

       this.processQueue = this.processQueue.bind(this); //processes the requests in the queue

       /*
        creates an object store (if it doesn't exist), given
        the database name, new object store name & keypath. Also
        will append data to the new object store if osData is passed
       */
       this.createOS = this.createOS.bind(this);

       Database.isDBSupported(); //returns if the database is supported
    }

    //determines if the data passed is valid
    static isValidType(data, dataName) {
        if ( typeof(data) === 'undefined' ) {
            console.log(`ERR isValidType(): "${dataName}" info not provided`);
            return false;
        }

        console.log(`isValidType(): "${dataName}" info valid :D`);
        return true;
    }

    //determines if indexedDB is supported
    static isDBSupported() {
        if ( !('indexedDB' in window) ) {
            console.log('isDBSupported(): indexedDB is NOT supported by the browser :(');
            return false; 
        }

        console.log('isDBSupported(): indexedDB is supported by the browser :D');
        return true;
    }

    addToQueue(action = undefined, dbName = undefined, dbVersion = undefined, osName = undefined, osKeyPath = undefined, osData = undefined) {
        try {
            switch(action) {
                case 'create':
                    console.log(`Creating object store "${osName}"`);
                    this.createOS(dbName, osName, osKeyPath, osData);
                    break;
                case 'get':
                    console.log(`Getting object store data`);
                    break;
                case 'add':
                    console.log(`Adding object store data`);
                    break;
                case 'load':
                    console.log(`Loading object store data`);
                    break;
            }
        }
        catch(err) {
            console.log(`ERR addToQueue(): ${err.message}`);
        }
    }

    processQueue() {
        try {
            console.log('\n*ENTERING processQueue()');

            console.log('**not implemented D:');

            console.log('*LEAVING processQueue()\n');
        }
        catch(err) {
            console.log(`ERR processQueue(): ${err.message}`);
        }
    }

    createOS(dbName = undefined, dbVersion = undefined, osName = undefined, osKeyPath = undefined, osData = undefined) {
        try {
            console.log('\n*ENTERING createOS()');
            let osCreated = false;
            //required arguments. osData is only used if passed
             if ( Database.isValidType(dbName, 'database name') &&
                  Database.isValidType(dbVersion, 'database version') &&
                  Database.isValidType(osName, 'object store name') &&
                  Database.isValidType(osKeyPath, 'object key path') ) {

                    let dbPromise = idb.open( dbName, dbVersion, (upgrade) => {
                        console.log(`createOS(): upgrading database "${dbName}" to version ${dbVersion}`);

                         //object store hasn't been created
                         if ( !upgrade.objectStoreNames.contains( osName ) ) {
                            console.log(`**createOS(): creating object store "${osName}"`);
                            osCreated = true;

                            upgrade.createObjectStore( osName, {keyPath: osKeyPath} );
                        }

                        else { //object store already exists
                            console.log(`createOS(): the object store ${osName} already exists - no action taken`);
                        }
                    })
                    .catch(err => {
                        console.log(`ERR createOS(): ${err.message}`);
                    })
                    .then( db => {
                        console.log(`Database successfully opened: ${dbName}`);

                        if ( !osCreated ) {
                            console.log(`createOS(): object store "${osName}" not created`);
                        }

                        if ( Database.isValidType(osData, 'os data') ) {
                            //add object store data to current object store
                            console.log('**createOS(): object store data given - NEED TO IMPLEMENT addData()');
                        }

                        else { //object store data not given - no data added
                            console.log('createOS(): object store data not given - no action taken');
                        }
                    })
                    .catch(err => {
                        console.log(`ERR createOS(): ${err.message}`);
                    });
                  }

            else { //required arguments not given
                console.log('createOS(): required arguments not given - no action taken');                  
            }

            console.log('*LEAVING createOS()\n');
        }
        catch(err) {
            console.log(`ERR createOS(): ${err.message}`);
        }
    }
}

export default Database;
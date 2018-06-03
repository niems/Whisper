import idb from 'idb'; 
import Events from 'events';

/**
 * database versioning:
 * 1 -  database is created but no object stores exist
 * 
 * 2 -  database is created & this.allMessages have been previously stored
 *     the stored object stores (channels) will all be pulled and updated
 *     on the client side
 */

class Database {
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


    constructor(dbName) {
        this.databaseName = dbName; //name used for current database - MUST be passed when creating an instance of the database
        this.database = undefined; //once successfully opened, stores a reference to the database

        /*
        each requested database action is put into the queue, executing in the order received
        the exception would be storing data - if storing data, it could go through the queue
        to store the rest of the data for the current object store, removing each from the 
        queue once complete
        */
        this.dataQueue = []; 

        this.openDB = this.openDB.bind(this); //assumes you don't know the database version - should be called before createOS

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

       //this.openDB();
        this.createOS();
    }
    
    openDB(dbVersion = 1) {
        return (
            new Promise( (resolve, reject) => {
                if ( !Database.isDBSupported() ) { //returns if the database is supported
                    reject();
                }        

                let dbPromise = idb.open( this.databaseName, dbVersion, upgradeDB => {
                    console.log(`openDB() upgrading - current upgradeDB val: ${JSON.stringify(upgradeDB)}\n\n`);

                    this.databaseOldVersion = upgradeDB.oldVersion;
                })
                .then( db => {
                    console.log('openDB(): database successfully opened & reference stored');
                    console.log(`openDB() database val: ${JSON.stringify(db)}\n\n`);
    
                    this.database = db; //stores database reference
                    resolve('successfully opened database');
                })
                .catch( err => {
                    console.log(`ERR openDB(): ${err.message}`);   
                    console.log(`ERR openDB() data: ${JSON.stringify(err)}`);             
                    reject('failed to open database');
                });
            })
        );
    }

    createOS() {
        //check if creating an upgrade transaction without reopening the database is possible
        console.log('\n*ENTERING createOS()');
        let databaseVersion = 1;
        let dbPromise = this.openDB( databaseVersion );
        
        dbPromise.then( result => {
            console.log(`createOS() result: ${result}`);
            console.log(`createOS() database version: ${JSON.stringify(this.database)}`);
        })
        .catch( err => {
            console.log(`ERR createOS(): ${JSON.stringify(err)}`);
        });
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

    /*
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
    */
}

export default Database;
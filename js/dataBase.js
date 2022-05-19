import { buildNavBar, buildTable } from "./homePage.js";
import { loadTheme, loadUkr } from "./settings.js";


if (!window.indexedDB) {
    alert("Your browser doesn't support IndexedDB.");
}


let db,
    requestIDBOpen = window.indexedDB.open("LinksAndBookMarksDB", 2);


requestIDBOpen.onerror = event => {
    db = event.target.result;
    console.error('DBerror', db);
}


requestIDBOpen.onsuccess = async (event) => {
    db = event.target.result;

    console.log('DB init succes');


    const settingsList = await readAllFromDatabaseByIndex(undefined, undefined, 'settingsOS');
    if (settingsList.length == 0) {
        
        const response = await fetch("./js/defaultConfig.json");
        const defaultConfig = await response.json();
        
        defaultConfig.defaultLinks.forEach((obj) => {
            addToDatabase(obj, 'linksOS');
        })
        defaultConfig.defaultBookmarks.forEach((obj) => {
            addToDatabase(obj, 'bookmarksOS');
        })
        defaultConfig.defaultUserSettings.forEach((obj) => {
            addToDatabase(obj, 'settingsOS');
        })
    }


    loadTheme();
    buildNavBar();
    loadUkr();
}


requestIDBOpen.onupgradeneeded = event => {
    db = event.target.result;
    console.log('DBupgrade', db);
    if (!db.objectStoreNames.contains('linksOS')) {
        let linksObjectStore = db.createObjectStore('linksOS', { keyPath: 'ID' })
        linksObjectStore.createIndex('orderIndex', 'order', { unique: false });
    }
    if (!db.objectStoreNames.contains('bookmarksOS')) {
        let bookmarksObjectStore = db.createObjectStore('bookmarksOS', { keyPath: 'ID', autoIncrement: 'true' })
        bookmarksObjectStore.createIndex('belongsToIndex', 'belongsTo', { unique: false });
    }
    if (!db.objectStoreNames.contains('settingsOS')) {
        let settingsObjectStore = db.createObjectStore('settingsOS', { keyPath: 'name' })
    }
}


export function addToDatabase(object, OSName) {
    
    console.log('adding:', object, 'to:', OSName);

    let tx = db.transaction(OSName, 'readwrite');
    let store = tx.objectStore(OSName);
    let request = store.add(object);

    request.onsuccess = event => {
        console.log('successfully added an object');
    };
    request.onerror = error => {
        console.log('error in request to add');
    };
}


export function removeFromDatabase(key, OSName) {
    
    console.log('removing:', key, 'from:', OSName);

    let tx = db.transaction(OSName, 'readwrite');
    let store = tx.objectStore(OSName);
    let request = store.delete(key);

    request.onsuccess = event => {
        console.log('successfully removed an object');
        //move on to the next request in the transaction or
        //commit the transaction
    };
    request.onerror = error => {
        console.log('error in request to add');
    };
}


export function removeAllFromDatebase(objects) {
    
    console.log('removing these objects:');
    console.table(objects)

    objects.forEach(object => {
        removeFromDatabase(object.ID, 'bookmarksOS');
    })
}


export function readFromDatabase(key, OSName, callback) {

    return new Promise(resolve => {

        console.log('reading:', key,'from:', OSName);

        let tx = db.transaction(OSName, 'readonly');
        let store = tx.objectStore(OSName);
        let request = store.get(key);

        request.onsuccess = event => {
            let object = event.target.result;

            if (callback) {
                console.warn('used a callback');
                callback(object);
            }
            resolve(object);
        }
        request.onerror = event => {
            let object = event.target.result;
            console.warn(object, event);
        }
    });
}


export function readAllFromDatabaseByIndex(indexName, range, OSName, callback) {

    return new Promise(resolve => {

        console.log('reading:', indexName, range, 'from:', OSName);

        let tx = db.transaction(OSName, 'readonly');
        let store = tx.objectStore(OSName);
        let request;

        if (indexName) {
            let index = store.index(indexName);
            request = index.getAll(range);
        } else {
            request = store.getAll();
        }
        request.onsuccess = event => {
            let object = event.target.result;

            if (callback) {
                console.warn('used a callback');
                callback(object);
            }
            resolve(object);
        }
        request.onerror = event => {
            let object = event.target.result;
            console.warn(object, event);
        }
    });
}


export function editDatabase(object, OSName, callback) {
    
    console.log('editing object:', object, 'in:', OSName );

    let tx = db.transaction(OSName, 'readwrite');
    let store = tx.objectStore(OSName);
    let request = store.put(object);

    request.onsuccess = event => {
        console.log('successfully edited an object');
        if (callback) {
            callback();
        }
    };
    request.onerror = error => {
        console.error(error);
    };
}

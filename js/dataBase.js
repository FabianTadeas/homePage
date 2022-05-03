import { buildNavBar, buildTable } from "./homePage.js";
import { defaultLinks, defaultBookmarks, defaultUserSettings } from './defaultFiles.js';
import { switchTheme } from "./settings.js";



if (!window.indexedDB) {
    alert("Your browser doesn't support IndexedDB.");
}


let db,
    requestIDBOpen = window.indexedDB.open("LinksAndBookMarksDB", 2);







requestIDBOpen.onerror = event => {
    db = event.target.result;
    console.error('DBerror', db);
}


requestIDBOpen.onsuccess = event => {
    db = event.target.result;
    console.log('DBsucces');


    let txl = db.transaction('linksOS', 'readwrite');
    let storel = txl.objectStore('linksOS');
    let requestl = storel.getAll();
    requestl.onsuccess = event => {
        if (event.target.result.length == 0) {
            defaultLinks.forEach((obj) => {
                let req = storel.add(obj);
            })
        }
    }


    let txb = db.transaction('bookmarksOS', 'readwrite');
    let storeb = txb.objectStore('bookmarksOS');
    let requestb = storeb.getAll();
    requestb.onsuccess = event => {
        if (event.target.result.length == 0) {
            defaultBookmarks.forEach((obj) => {
                let req = storeb.add(obj);
            })
        }
    }


    let txs = db.transaction('settingsOS', 'readwrite');
    let stores = txs.objectStore('settingsOS');
    let requests = stores.getAll();
    requests.onsuccess = event => {
        if (event.target.result.length == 0) {
            defaultUserSettings.forEach((obj) => {
                let req = stores.add(obj);
            })
        }
    }

    readFromDataBase('theme', 'settingsOS', switchTheme);
    readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS', buildNavBar);
}


requestIDBOpen.onupgradeneeded = event => {
    db = event.target.result;
    console.log('DBupgrade', db);
    if (!db.objectStoreNames.contains('linksOS')) {
        let linksObjectStore = db.createObjectStore('linksOS', { keyPath: 'ID' })
        linksObjectStore.createIndex('orderIndex', 'order', { unique: true });
    }
    if (!db.objectStoreNames.contains('bookmarksOS')) {
        let bookmarksObjectStore = db.createObjectStore('bookmarksOS', { keyPath: 'ID', autoIncrement: 'true' })
        bookmarksObjectStore.createIndex('belongsToIndex', 'belongsTo', { unique: false });
    }
    if (!db.objectStoreNames.contains('settingsOS')) {
        let settingsObjectStore = db.createObjectStore('settingsOS', { keyPath: 'name' })
    }
}


export function addToDataBase(object, OSName) {
    console.log(object, OSName);
    let tx = db.transaction(OSName, 'readwrite');
    let store = tx.objectStore(OSName);
    let request = store.add(object);
    request.onsuccess = event => {
        console.log('successfully added an object');
        //move on to the next request in the transaction or
        //commit the transaction
    };
    request.onerror = error => {
        console.log('error in request to add');
    };
}


export function removeFromDataBase(key, OSName) {
    console.log(key, OSName);
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


export function removeAllFromDateBase(objects) {
    objects.forEach(object => {
        removeFromDataBase(object.ID, 'bookmarksOS');
    })
}


export function readFromDataBase(key, OSName, callback) {
    console.log(key, OSName);
    let tx = db.transaction(OSName, 'readonly');
    let store = tx.objectStore(OSName);
    let request = store.get(key);

    request.onsuccess = event => {
        let object = event.target.result;
        callback(object);
    }
    request.onerror = event => {
        let object = event.target.result;
        console.warn(object, event);
    }
}


export function readAllFromDataBaseByIndex(indexName, range, OSName, callback) {
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
        callback(object);
    }
    request.onerror = event => {
        let object = event.target.result;
        console.warn(object, event);
    }
}


export function editDataBase(object, OSName) {
    console.log(object, OSName)
    let tx = db.transaction(OSName, 'readwrite');
    let store = tx.objectStore(OSName);
    let request = store.put(object);
    request.onsuccess = event => {
        console.log('successfully edited an object');
    };
    request.onerror = error => {
        console.error(error);
    };
}
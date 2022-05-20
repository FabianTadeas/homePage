import { buildNavBar, download } from "./homePage.js";
import { addToDatabase, editDatabase, purgeObjectStore, readAllFromDatabaseByIndex, readFromDatabase } from "./dataBase.js";


export let editMode = false,
           theme;


export async function loadTheme() {

    theme = await readFromDatabase('theme', 'settingsOS');
    const themeReadOut = document.getElementById('themeState');
    themeReadOut.innerHTML = theme.themeList[theme.activeTheme];

    theme.themeList.forEach((obj) => {
        document.body.classList.remove(obj);
    })

    document.body.classList.add(theme.themeList[theme.activeTheme]);
}


export function settingsOpen() {

    const themeToggleButton = document.getElementById('themeToggle');
    themeToggleButton.addEventListener('click', async () => {
        
        console.log('theme switched');

        let theme = await readFromDatabase('theme', 'settingsOS');
        
        theme.activeTheme += 1;
        if (theme.activeTheme >= theme.themeList.length) {
            theme.activeTheme = 0;
        }

        editDatabase(theme, 'settingsOS');

        loadTheme();
    })



    let editModeToggle = document.getElementById('editModeToggle');
    editModeToggle.addEventListener('click', () => {
        editMode = !editMode;
        document.body.classList.toggle('editMode');
        buildNavBar();
    })


    let ukrToggle = document.getElementById('ukrToggle');
    ukrToggle.addEventListener('click', async () => {
        
        let ukraineObj = await readFromDatabase('ukraine', 'settingsOS');
        
        ukraineObj.active = !ukraineObj.active;
        
        editDatabase(ukraineObj, 'settingsOS');

        loadUkr()
    })


    let downloadProfile = document.getElementById('downloadProfileButton');
    downloadProfile.addEventListener('click', async (event) => {
        
        let links = await readAllFromDatabaseByIndex(undefined, undefined, 'linksOS');
        let bookmarks = await readAllFromDatabaseByIndex(undefined, undefined, 'bookmarksOS');
        let settings = await readAllFromDatabaseByIndex(undefined, undefined, 'settingsOS');
        let config = {linksOS: links,
                      bookmarksOS: bookmarks,
                      settingsOS: settings
        }
        let configJSON = JSON.stringify(config);
        download('config.json', configJSON)
    })


    let dropProfile = document.getElementById('dropProfileArea')
    dropProfile.addEventListener('dragover', (event) => {
        //if (event.dataTransfer.items[0].type == 'application/json') {
            console.log(event.dataTransfer);
            event.preventDefault();
        //}
    })
    dropProfile.addEventListener('drop', async (event) => {
        event.preventDefault();

        let files = event.dataTransfer.files;
        console.log(files[0]);
        let text = await files[0].text();
        
        console.log(text);
        
        let object = JSON.parse(text);
        console.table(object);
        
        let OSNamesList = ['bookmarksOS', 'linksOS', 'settingsOS'];
        OSNamesList.forEach(async (OSName) => {
            await purgeObjectStore(OSName);
            object[OSName].forEach(item => {
                addToDatabase(item, OSName);
                console.log(`added: ${item}`)
            })
        })
        location.reload(); 
    })
}



export async function loadUkr() {

    console.log('loading ukr')

    let ukraineObj = await readFromDatabase('ukraine', 'settingsOS');

    if (ukraineObj.active) document.getElementById('ukraine').classList.remove('hidden')
    if (!ukraineObj.active) document.getElementById('ukraine').classList.add('hidden')
}


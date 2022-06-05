import { buildNavBar, download } from "./homePage.js";
import { addToDatabase, editDatabase, purgeObjectStore, readAllFromDatabaseByIndex, readFromDatabase } from "./dataBase.js";

export let editMode = false;
let root = document.querySelector(':root');

console.log('settings imported');

const editModeToggleB = document.getElementById('editModeToggleB');
editModeToggleB.addEventListener('click', (event) => {
    editMode = !editMode;
    editModeToggleB.classList.toggle('selected');
    document.body.classList.toggle('editMode');
    buildNavBar();
})

export async function loadTheme() {
    
    let theme = await readFromDatabase('theme', 'settingsOS');
    const themeReadOut = document.getElementById('themeState');
    themeReadOut.innerHTML = theme.themeList[theme.activeTheme];
    
    
    let rootInEditmode = document.querySelector('body.editMode :root');
    let themeColors = await readFromDatabase(theme.themeList[theme.activeTheme], 'themesOS');

    

    for (const color in themeColors.colors) {
        root.style.setProperty(`--${color}`, themeColors.colors[color]);
    }
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
        
        console.log(event.dataTransfer);
        event.preventDefault();
        
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


    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizeReadOut = document.getElementById('fontSizeValue');
    fontSizeSlider.addEventListener('input', () => {
        fontSizeReadOut.innerHTML = fontSizeSlider.value;
        root.style.setProperty('--fontSize', `${fontSizeSlider.value}px`);
    })
    fontSizeSlider.addEventListener('mouseup', async () => {
        let fontObj = await readFromDatabase('fontSize', 'settingsOS'); 
        
        fontObj.value = fontSizeSlider.value;
        
        editDatabase(fontObj, 'settingsOS');
    })


    const defaultLinkSelector = document.getElementById('defaultLinkSelector');
    const linkList = document.querySelectorAll('table.link:not(#addLink, .extLink, .predefinedLink)');
    linkList.forEach(link => {
        let name = link.children[0].children[0].children[1].innerHTML;
        let option = document.createElement('option');
    
        option.innerHTML = name;
        option.value = link.id;

        defaultLinkSelector.appendChild(option);
    })

    defaultLinkSelector.addEventListener('input', async (event) => {
        console.warn(defaultLinkSelector.value);


        let oldLink = await readAllFromDatabaseByIndex('activeByDefaultIndex', 'yes', 'linksOS');
        oldLink = oldLink[0];
        console.log(oldLink)

        if (oldLink) {
            oldLink.activeByDefault = 'no';
            editDatabase(oldLink, 'linksOS');
        }
        
        if (defaultLinkSelector.value == 'undefined') return

        let newLink = await readFromDatabase(defaultLinkSelector.value, 'linksOS');
        newLink.activeByDefault = 'yes';
        editDatabase(newLink, 'linksOS');
    })
}


export async function loadUkr() {

    console.log('loading ukr')

    let ukraineObj = await readFromDatabase('ukraine', 'settingsOS');

    if (ukraineObj.active) document.getElementById('ukraine').classList.remove('hidden')
    if (!ukraineObj.active) document.getElementById('ukraine').classList.add('hidden')
}


export async function loadFontSize() {
    let fontObj = await readFromDatabase('fontSize', 'settingsOS');

    root.style.setProperty('--fontSize', `${fontObj.value}px`);



    const fontSizeReadOut = document.getElementById('fontSizeValue');
    fontSizeReadOut.innerHTML = fontObj.value;

    const fontSizeSlider = document.getElementById('fontSizeSlider');
    fontSizeSlider.value = fontObj.value;
}


import { buildNavBar } from "./homePage.js";
import { editDatabase, readAllFromDatabaseByIndex, readFromDatabase } from "./dataBase.js";


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
    themeToggleButton.addEventListener('click', async (event) => {
        
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
    editModeToggle.addEventListener('click', event => {
        editMode = !editMode;
        document.body.classList.toggle('editMode');
        buildNavBar();
    })


    let ukrToggle = document.getElementById('ukrToggle');
    ukrToggle.addEventListener('click', async (event) => {
        
        let ukraineObj = await readFromDatabase('ukraine', 'settingsOS');
        
        ukraineObj.active = !ukraineObj.active;
        
        editDatabase(ukraineObj, 'settingsOS');

        loadUkr()
    })


}


export async function loadUkr() {

    console.log('loading ukr')

    let ukraineObj = await readFromDatabase('ukraine', 'settingsOS');

    if (ukraineObj.active) document.getElementById('ukraine').classList.remove('hidden')
    if (!ukraineObj.active) document.getElementById('ukraine').classList.add('hidden')
}


import { buildNavBar } from "./homePage.js";
import { editDataBase, readAllFromDataBaseByIndex, readFromDataBase } from "./dataBase.js";


export let editMode = false,
           theme;


export async function loadTheme() {

    theme = await readFromDataBase('theme', 'settingsOS');
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

        let theme = await readFromDataBase('theme', 'settingsOS');
        
        theme.activeTheme += 1;
        if (theme.activeTheme >= theme.themeList.length) {
            theme.activeTheme = 0;
        }

        editDataBase(theme, 'settingsOS');

        loadTheme();
    })



    let editModeToggle = document.getElementById('editModeToggle');
    editModeToggle.addEventListener('click', event => {
        editMode = !editMode;
        document.body.classList.toggle('editMode');
        readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS', buildNavBar);
    })


}





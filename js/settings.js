import { buildNavBar } from "./homePage.js";
import { editDataBase, readAllFromDataBaseByIndex, readFromDataBase } from "./dataBase.js";


export let editMode = false;


export async function loadTheme() {

    let theme = await readFromDataBase('theme', 'settingsOS');
    console.log(theme.lightTheme);

    if (theme.lightTheme) {
        document.body.classList.add('lightMode');
    } else {
        document.body.classList.remove('lightMode');
    }

}


export function settingsOpen() {

    document.getElementById('darkLightToggle').addEventListener('click', async (event) => {
        console.log('theme switched');
        let theme = await readFromDataBase('theme', 'settingsOS');
        theme.lightTheme = !theme.lightTheme;
        editDataBase(theme, 'settingsOS');
        loadTheme();
    })



    let editModeToggle = document.getElementById('editModeToggle');
    editModeToggle.addEventListener('click', event => {
        if (editMode == false) {
            editMode = true;
            editModeToggle.classList.add('selected');
        } else {
            editMode = false;
            editModeToggle.classList.remove('selected');
        }
        document.body.classList.toggle('editMode');
        readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS', buildNavBar);
    })


}





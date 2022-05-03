import { buildNavBar } from "./homePage.js";
import { editDataBase, readAllFromDataBaseByIndex, readFromDataBase } from "./dataBase.js";


export let editMode = false;


export function switchTheme(mode) {

    if (mode.lightTheme) {
        document.body.classList.add('lightMode');
    }
    if (!mode.lightTheme) {
        document.body.classList.remove('lightMode');
    }

}


export function settingsOpen() {


    document.getElementById('darkLightToggle').addEventListener('click', event => {
        console.log('theme switched');
        if (document.body.classList.contains('lightMode')) {
            let obj = {
                name: 'theme',
                lightTheme: false
            }
            editDataBase(obj, 'settingsOS')
        }
        if (!document.body.classList.contains('lightMode')) {
            let obj = {
                name: 'theme',
                lightTheme: true
            }
            editDataBase(obj, 'settingsOS')
        }
        readFromDataBase('theme', 'settingsOS', switchTheme);
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





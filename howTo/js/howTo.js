import * as indexedDB from '../../js/dataBase.js';

let DBInitCalls = {
    '../howTo/js/howTo.js': ['loadTheme', 'loadUkr']
}
indexedDB.onDatabaseInitCall(DBInitCalls);

let footerLinks = document.querySelectorAll('#footerNavbar>li'),
    root = document.querySelector(':root');

root.style.setProperty('--numberOfFooterLinks', footerLinks.length);

export async function loadTheme() {
    let theme = await indexedDB.readFromDatabase('theme', 'settingsOS');
    document.body.classList.add(theme.themeList[theme.activeTheme]);
}

export async function loadUkr() {
    let ukraineObj = await indexedDB.readFromDatabase('ukraine', 'settingsOS');
    if (ukraineObj.active) document.getElementById('ukraine').classList.remove('hidden')
}

let navBarLinksList = document.querySelectorAll('.link')
navBarLinksList.forEach(link => {
    link.addEventListener('click', (event) => {
        let url = event.target.closest('.link').dataset.url;
        location.href = url;
    })
})
import * as indexedDB from '../../js/dataBase.js';

let DBInitCalls = {
    '../howTo/js/howTo.js': ['loadTheme', 'loadUkr', 'loadFontSize']
}
indexedDB.onDatabaseInitCall(DBInitCalls);

let contentBox = document.getElementById('contentBox'),
    mainLinks = document.querySelectorAll('#mainNavbar>li'),
    footerLinks = document.querySelectorAll('#footerNavbar>li'),
    root = document.querySelector(':root');

root.style.setProperty('--numberOfFooterLinks', footerLinks.length);

export async function loadTheme() {
    let theme = await indexedDB.readFromDatabase('theme', 'settingsOS');
 
    let themeColors = await indexedDB.readFromDatabase(theme.themeList[theme.activeTheme], 'themesOS');

    

    for (const color in themeColors.colors) {
        root.style.setProperty(`--${color}`, themeColors.colors[color]);
    }
}

export async function loadUkr() {
    let ukraineObj = await indexedDB.readFromDatabase('ukraine', 'settingsOS');
    if (ukraineObj.active) document.getElementById('ukraine').classList.remove('hidden')
}

export async function loadFontSize() {
    let fontObj = await indexedDB.readFromDatabase('fontSize', 'settingsOS');
    root.style.setProperty('--fontSize', `${fontObj.value}px`);
}

let navBarLinksList = document.querySelectorAll('.link')
navBarLinksList.forEach(link => {
    link.addEventListener('click', (event) => {
        let url = event.target.closest('.link').dataset.url;
        location.href = url;
    })
})

let anchors = []
document.addEventListener('DOMContentLoaded', function() {
for (let i = 0; i < mainLinks.length; i++) {
    let linkUrl = mainLinks[i].firstElementChild.dataset.url;
    let anchorID = linkUrl.substring(1);
    let anchor = document.getElementById(anchorID);
    let start;
    if (anchor.offsetTop - 100 > 0) {start = anchor.offsetTop - 100} else {start = 1}

    anchors[i] = {url: linkUrl,
                  start: start
    }
}
for (let i = 0; i < anchors.length; i++) {
    if (anchors[i+1]) {
        anchors[i].end = anchors[i+1].start;
    }
    if (!anchors[i+1]) {
        anchors[i].end = contentBox.scrollHeight;
    }
}
console.table(anchors);
}, false);

contentBox.onscroll = () => {
    let currentDepth = contentBox.scrollTop;
    anchors.forEach(anchor => {
        let link = document.querySelector(`table[data-url="${anchor.url}"]`)
        link.classList.remove('selected');
        if (currentDepth > anchor.start && currentDepth < anchor.end) {
            link.classList.add('selected');
        }
    })
}

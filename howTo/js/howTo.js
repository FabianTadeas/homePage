import * as indexedDB from '../../js/dataBase.js';

let DBInitCalls = {
    '../howTo/js/howTo.js': ['loadTheme', 'loadUkr']
}
indexedDB.onDatabaseInitCall(DBInitCalls);

let contentBox = document.getElementById('contentBox'),
    mainLinks = document.querySelectorAll('#mainNavbar>li'),
    footerLinks = document.querySelectorAll('#footerNavbar>li'),
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

let anchors = []
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
import { addToDataBase, readAllFromDataBaseByIndex, readFromDataBase, removeFromDataBase, editDataBase, removeAllFromDateBase } from './dataBase.js';
import { defaultLinks, defaultBookmarks, defaultUserSettings } from './defaultFiles.js';
import { settingsOpen, editMode } from "./settings.js";


let contentBox = document.getElementById("contentBox"),
    navBarLinksList,
    activeLinkId,
    navBar = document.getElementById('navBar'),
    highestNavBarOrder,
    formBox = document.getElementById('formBox');


function NBListener() {
    navBarLinksList.forEach(item => {
        item.addEventListener('click', event => {
            //adds and removes the selected class from navbar links
            console.log('link clicked!')
            contentBox.innerHTML = '';
            if (item.id !== activeLinkId) {
                if (activeLinkId) {
                    let activeLink = document.getElementById(activeLinkId)
                    if (activeLink) {
                        activeLink.classList.remove('selected');
                    }
                }
                activeLinkId = item.id;
                document.getElementById(activeLinkId).classList.add('selected');

                //deletes activeBox content and writes new
                if (activeLinkId !== 'settings') {
                    readAllFromDataBaseByIndex('belongsToIndex', activeLinkId, 'bookmarksOS', buildTable);
                } else {
                    let settingsClone = document.getElementById('settingsMenu').cloneNode(true);
                    contentBox.append(settingsClone);
                    settingsOpen();
                }
            } else {
                document.getElementById(activeLinkId).classList.remove('selected');
                activeLinkId = undefined;
            }

        })
    })
}


export function buildNavBar(data) {
    navBar.innerHTML = '';
    data.forEach((object) => {
        const a = document.createElement('a');
        const i = document.createElement('i');
        const li = document.createElement('li');
        const p = document.createElement('p');
        if (object.type == 'link') {
            a.id = object.ID;
            if (object.icon) {
                i.classList.add('ti')
                i.classList.add('ti-' + object.icon)
                a.append(i);
            }
            a.append(object.name);
            li.append(a);
            if (editMode && object.ID !== 'settings') {
                const ei = document.createElement('i');
                ei.classList.add('ti')
                ei.classList.add('ti-adjustments-horizontal')
                ei.dataset.editing = object.ID;
                li.append(ei);
            }

            navBar.appendChild(li);
        }
        if (object.type == 'title') {

            p.innerText = object.name;
            p.dataset.editing = object.ID;
            navBar.appendChild(p);
        }

        highestNavBarOrder = object.order;
    })
    if (editMode) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');
        i.classList.add('ti');
        i.classList.add('ti-circle-plus');
        a.id = 'addLink';
        a.classList.add('add');
        a.append(i);
        li.append(a);
        navBar.appendChild(li);
    }

    navBarLinksList = document.querySelectorAll('ul#navBar a:not(#addLink)');
    NBListener();
    if (editMode) {
        editModeUpdate()
    }
}


export function buildTable(content) {
    const table = document.createElement('table');
    contentBox.innerHTML = ''
    content.forEach((object) => {
        const tr = table.insertRow();
        const i = document.createElement('i');

        if (!editMode) {
            tr.setAttribute('onclick', 'window.open("' + object.link + '")');
        }
        if (editMode) {
            tr.id = object.ID
        }

        if (object.icon) {
            i.classList.add('ti')
            i.classList.add('ti-' + object.icon)
        }


        let objecty = [
            object.name,
            object.link,
            i
        ]


        for (let i = 0; i < objecty.length; i++) {
            const element = objecty[i];
            const td = tr.insertCell();
            td.append(element);
        }



    })
    if (editMode) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');
        i.classList.add('ti');
        i.classList.add('ti-playlist-add');
        a.id = 'addBookmark';
        a.classList.add('add');
        a.append(i);
        li.append(a);
        table.appendChild(li);
    }
    contentBox.append(table);
    if (editMode) {
        editModeUpdate()
    }
}


const addLinkHandler = function (event, newLink) {
    if (!newLink) {
        let questions = [
            {
                type: 'radio',
                askFor: 'type',
                options: { linkName: 'link', titleName: 'title' },
            },
            {
                type: 'text',
                askFor: 'name',
            },
            {
                type: 'text',
                askFor: 'icon',
                default: 'bookmark'
            }
        ]
        buildForm(questions, addLinkHandler);
    }
    if (newLink) {
        let link = {}

        if (newLink.elements['link'].checked) link.type = 'link';

        if (newLink.elements['title'].checked) link.type = 'title';

        link.name = newLink.elements['name'].value
        link.icon = newLink.elements['icon'].value
        link.ID = link.name + Date.now();
        link.order = highestNavBarOrder + 1;
        addToDataBase(link, 'linksOS');
        readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS', buildNavBar);
    }
}


const addBookmarkHandler = function (event, newBookmark) {
    if (!newBookmark) {
        let questions = [
            {
                type: 'text',
                askFor: 'name',
            },
            {
                type: 'text',
                askFor: 'URL',
            },
            {
                type: 'text',
                askFor: 'icon',
            }
        ]
        buildForm(questions, addBookmarkHandler);
    }
    if (newBookmark) {
        let bookmark = {}

        bookmark.name = newBookmark.elements['name'].value;
        bookmark.icon = newBookmark.elements['icon'].value;
        bookmark.link = newBookmark.elements['URL'].value;
        bookmark.belongsTo = activeLinkId;
        addToDataBase(bookmark, 'bookmarksOS');
        readAllFromDataBaseByIndex('belongsToIndex', activeLinkId, 'bookmarksOS', buildTable);
    }
}


let oldBookmark;
const bookmarkEditHandler = function (event, newBookmark) {
    let which = event.target;
    if (which) {
        let key = parseInt(event.target.parentElement.id, 10);
        readFromDataBase(key, 'bookmarksOS', bookmarkEditHandler);
    }
    if (!which) {
        if (!newBookmark) {
            oldBookmark = event;
            let questions = [
                {
                    type: 'text',
                    askFor: 'name',
                    default: oldBookmark.name
                },
                {
                    type: 'text',
                    askFor: 'URL',
                    default: oldBookmark.link
                },
                {
                    type: 'text',
                    askFor: 'icon',
                    default: oldBookmark.icon
                },
                {
                    type: 'button',
                    askFor: 'delete',
                }
            ]
            buildForm(questions, bookmarkEditHandler);
        }
        if (newBookmark) {
            if (newBookmark !== 'delete') {
                let newNewBookmark = oldBookmark;
                newNewBookmark.name = newBookmark.elements['name'].value;
                newNewBookmark.icon = newBookmark.elements['icon'].value;
                newNewBookmark.link = newBookmark.elements['URL'].value;
                editDataBase(newNewBookmark, 'bookmarksOS');
                readAllFromDataBaseByIndex('belongsToIndex', activeLinkId, 'bookmarksOS', buildTable);
            }
            if (newBookmark == 'delete') {
                removeFromDataBase(oldBookmark.ID, 'bookmarksOS')
                readAllFromDataBaseByIndex('belongsToIndex', activeLinkId, 'bookmarksOS', buildTable);
            }
        }
    }
}


let oldLink;
const linkEditHandler = function (event, newLink) {
    let which = event.target;
    if (which) {
        let key = event.target.dataset.editing;
        readFromDataBase(key, 'linksOS', linkEditHandler);
    }
    if (!which) {
        //console.log(oldLink);
        if (!newLink) {
            oldLink = event;
            let questions = [
                {
                    type: 'text',
                    askFor: 'name',
                    default: oldLink.name
                },
                {
                    type: 'text',
                    askFor: 'icon',
                    default: oldLink.icon
                },
                {
                    type: 'button',
                    askFor: 'delete'
                }
            ]
            buildForm(questions, linkEditHandler);
        }
        if (newLink) {
            if (newLink !== 'delete') {
                console.log(newLink.elements['name'].value, newLink.elements['icon'].value);
                console.log(oldLink);
                let newNewLink = oldLink;
                newNewLink.name = newLink.elements['name'].value;
                newNewLink.icon = newLink.elements['icon'].value;
                editDataBase(newNewLink, 'linksOS');
                readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS', buildNavBar);
            }
            if (newLink == 'delete') {
                removeFromDataBase(oldLink.ID, 'linksOS')
                readAllFromDataBaseByIndex('belongsToIndex', oldLink.ID, 'bookmarksOS', removeAllFromDateBase);
                readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS', buildNavBar);
                contentBox.innerHTML = '';
            }
        }
    }
}


function editModeUpdate() {

    const addLinkButton = document.getElementById('addLink');
    addLinkButton.addEventListener('click', addLinkHandler);

    const addBookmarkButton = document.getElementById('addBookmark');
    if (addBookmarkButton) {
        addBookmarkButton.addEventListener('click', addBookmarkHandler);
    }

    const bookmarksList = document.querySelectorAll('div#contentBox>table>tbody>tr');
    const editBookmark = bookmarksList.forEach(bookmark => {
        bookmark.addEventListener('click', bookmarkEditHandler);
    })

    const linkEditButtonsList = document.querySelectorAll('ul#navBar>li>i');
    const editLink = linkEditButtonsList.forEach(link => {
        link.addEventListener('click', linkEditHandler);
    })
    const titleEditButtonsList = document.querySelectorAll('ul#navBar>p');
    const editTitle = titleEditButtonsList.forEach(title => {
        title.addEventListener('click', linkEditHandler);
    })
}


function buildForm(questions, callback) {
    formBox.innerHTML = '';
    const form = document.createElement('form');
    const div = document.createElement('div');
    const input = document.createElement('input');
    const label = document.createElement('label');
    const br = document.createElement('br');
    questions.forEach(object => {

        const div = document.createElement('div');
        const input = document.createElement('input');
        const label = document.createElement('label');
        console.log(object);

        if (object.type == 'radio') {
            console.log(object.options);

            for (let i in object.options) {
                console.log(object.options[i]);
                const input = document.createElement('input');
                const label = document.createElement('label');
                const br = document.createElement('br');
                input.type = object.type;
                input.id = object.options[i];
                input.name = object.askFor;

                label.setAttribute('for', object.options[i]);
                label.innerText = object.options[i];

                if (div.childElementCount == 0) {
                    input.checked = true;
                }

                div.append(input, label, br);
            }

            form.append(div);


        }
        if (object.type == 'text') {
            label.setAttribute('for', object.askFor);
            label.innerText = object.askFor;

            input.type = object.type;
            input.id = object.askFor;
            input.name = object.askFor;

            if (object.default) {
                input.value = object.default;
            }

            div.append(label, input);
            form.append(div);
        }
        if (object.type == 'button') {
            input.type = object.type;
            input.value = object.askFor;
            input.name = object.askFor;
            input.id = object.askFor + 'Button';

            div.append(input);
            form.append(div);
        }

    })

    const type = ['submit', 'reset'];
    const value = ['submit', 'cancel'];
    for (let i = 0; i < type.length; i++) {
        const input = document.createElement('input');
        const br = document.createElement('br');
        input.type = type[i];
        input.value = value[i];
        input.name = value[i];
        div.append(input, br);
    }

    form.append(div);

    form.setAttribute('autocomplete', 'off');
    form.id = 'form';
    formBox.append(form);





    formBox.classList.remove('hidden');
    let formId = document.getElementById('form');
    formId.addEventListener('submit', event => {
        event.preventDefault();

        if (formId.elements['name'].value) {
            callback('', formId);
            formId.reset();
            formBox.classList.add('hidden');
            formBox.innerHTML = '';
        }

    });
    formId.addEventListener('reset', event => {
        console.warn('canceled');
        formBox.classList.add('hidden');
        formBox.innerHTML = '';
    });
    let deleteButton = document.getElementById('deleteButton')
    console.log(deleteButton);
    if (deleteButton) {
        deleteButton.addEventListener('click', event => {
            console.warn('deleted');
            callback('', 'delete');
            formId.reset()
        })
    }
}
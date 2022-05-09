import { addToDataBase, readAllFromDataBaseByIndex, readFromDataBase, removeFromDataBase, editDataBase, removeAllFromDateBase } from './dataBase.js';
import { defaultLinks, defaultBookmarks, defaultUserSettings } from './defaultFiles.js';
import { settingsOpen, editMode } from "./settings.js";


let contentBox = document.getElementById("contentBox"),
    navBarLinksList,
    activeLinkId,
    navBar = document.getElementById('navBar'),
    highestNavBarOrder,
    formBox = document.getElementById('formBox'),
    previousLink,
    previousLinkId,
    activeLink;


const onClick = (event) => {
    previousLinkId = activeLinkId;
    activeLinkId = event.target.id;
    activeLink = document.getElementById(activeLinkId);
    previousLink = document.getElementById(previousLinkId);
    if (previousLink == activeLink) {
        activeLink = undefined;
        activeLinkId = undefined;
    }
    NBupdate();
}
function NBupdate() {
    console.log('updating nb listeners')
    navBarLinksList = document.querySelectorAll('ul#navBar a:not(#addLink)');
    
    navBarLinksList.forEach(link => {
        link.addEventListener('click', onClick);
    })

    if (previousLink) {
        previousLink.classList.remove('selected');
    }

    if (activeLink) {
        activeLink.classList.add('selected');
        buildTable()
    } else {
        contentBox.innerHTML = '';
    }
}


export async function buildNavBar(data) {
    
    let content;
    if (data) {
        content = data;
    }
    if (!data) {
        content = await readAllFromDataBaseByIndex('orderIndex', undefined, 'linksOS');
    }
    
    navBar.innerHTML = '';
    
    content.forEach((object) => {
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
            li.dataset.order = object.order;
            navBar.appendChild(li);
        }
        if (object.type == 'title') {

            p.innerText = object.name;
            p.dataset.editing = object.ID;
            p.dataset.order = object.order;
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
    if (activeLinkId) {
        let activeLink = document.getElementById(activeLinkId)
        if (activeLink) {
            activeLink.classList.add('selected');
        }
    }

    NBupdate();
    if (editMode) {
        editModeUpdate()
    }
}


export async function buildTable(data) {
    
    console.log('building table');
    
    contentBox.innerHTML = '';

    let content;
    if (data) {
        content = data;
    }
    if (!data) {
        if (activeLinkId !== 'settings'){
            content = await readAllFromDataBaseByIndex('belongsToIndex', activeLinkId, 'bookmarksOS');
        } else {
            let settingsClone = document.getElementById('settingsMenu').cloneNode(true);
            contentBox.append(settingsClone);
            settingsOpen();
            return
        }
    }
    
    const table = document.createElement('table');
    
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


const addLinkHandler = async function () {

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
    let answers = await buildForm(questions);

    let link = {};

    if (answers.link) link.type = 'link';

    if (answers.title) link.type = 'title';

    link.name = answers.name;
    link.icon = answers.icon;
    link.ID = link.name + Date.now();
    link.order = highestNavBarOrder + 1;
    addToDataBase(link, 'linksOS');
    buildNavBar();

}


const addBookmarkHandler = async function () {

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
    let answers = await buildForm(questions);


    let bookmark = {}

    bookmark.name = answers.name;
    bookmark.icon = answers.icon;
    bookmark.link = answers.URL;
    bookmark.belongsTo = activeLinkId;
    addToDataBase(bookmark, 'bookmarksOS');
    buildTable()

}


const bookmarkEditHandler = async function (event) {

    let key = parseInt(event.target.parentElement.id, 10);
    let oldBookmark = await readFromDataBase(key, 'bookmarksOS');

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

    let answers = await buildForm(questions);

    if (answers == 'delete') {
        removeFromDataBase(oldBookmark.ID, 'bookmarksOS')
        buildTable()
        return;
    }
    let newBookmark = oldBookmark;
    newBookmark.name = answers.name;
    newBookmark.link = answers.URL;
    newBookmark.icon = answers.icon;


    editDataBase(newBookmark, 'bookmarksOS');
    buildTable()
}


const linkEditHandler = async function (event) {

    let key = event.target.dataset.editing;
    let oldLink = await readFromDataBase(key, 'linksOS');

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

    let answers = await buildForm(questions);

    if (answers == 'delete') {
        removeFromDataBase(oldLink.ID, 'linksOS')
        readAllFromDataBaseByIndex('belongsToIndex', oldLink.ID, 'bookmarksOS', removeAllFromDateBase);
        if (oldLink.ID == activeLinkId) {
            activeLink = undefined;
            activeLinkId = undefined;
        }
        buildNavBar();
        return;
    }
    let newLink = oldLink;
    newLink.name = answers.name;
    newLink.icon = answers.icon;


    editDataBase(newLink, 'linksOS');
    buildNavBar()
}


function editModeUpdate() {

    const addLinkButton = document.getElementById('addLink');
    addLinkButton.addEventListener('click', addLinkHandler);

    const addBookmarkButton = document.getElementById('addBookmark');
    if (addBookmarkButton) {
        addBookmarkButton.addEventListener('click', addBookmarkHandler);
    }

    const bookmarksList = document.querySelectorAll('div#contentBox>table>tbody>tr');
    bookmarksList.forEach(bookmark => {
        bookmark.addEventListener('click', bookmarkEditHandler);
    })

    const linkEditButtonsList = document.querySelectorAll('ul#navBar>li>i, ul#navBar>p');
    linkEditButtonsList.forEach(link => {
        link.addEventListener('click', linkEditHandler);
    })
}


function buildForm(questions, callback) {

    return new Promise(resolve => {

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

        const subDel = `<input type="submit" value="create" name="submit"> <br>
                        <input type="reset" value="cancel" name="cancel">`;
        div.innerHTML = subDel;
        form.append(div);

        form.setAttribute('autocomplete', 'off');
        form.id = 'form';
        formBox.append(form);





        formBox.classList.remove('hidden');
        const formId = document.getElementById('form');

        formId.addEventListener('submit', event => {
            event.preventDefault();

            if (formId.elements['name'].value) {

                let inputs = formId.querySelectorAll('input')
                let values = {};
                
                inputs.forEach(input => {
                    
                    if (input.type == 'text') {
                        values[input.id] = input.value;
                    }
                    
                    if (input.type == 'radio') {
                        values[input.id] = input.checked;
                    }
                })

                console.log('form results:')
                console.table(values);

                if (callback) {
                    console.warn('used a callback');
                    callback('', formId);
                }

                resolve(values);
                
                formId.reset();
            }

        });

        formId.addEventListener('reset', event => {
            console.warn('canceled');
            formBox.classList.add('hidden');
            formBox.innerHTML = '';
        });

        let deleteButton = document.getElementById('deleteButton')
        if (deleteButton) {
            deleteButton.addEventListener('click', event => {
                console.warn('deleted');

                if (callback) {
                    console.warn('used a callback');
                    callback('', 'delete');
                }

                resolve('delete');

                formId.reset()
            })
        }

    })

}
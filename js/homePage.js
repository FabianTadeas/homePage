import { addToDatabase, readAllFromDatabaseByIndex, readFromDatabase, removeFromDatabase, editDatabase, removeAllFromDatebase } from './dataBase.js';
import { defaultLinks, defaultBookmarks, defaultUserSettings } from './defaultFiles.js';
import { settingsOpen, editMode } from "./settings.js";


let contentBox = document.getElementById("contentBox"),
    navBarLinksList,
    activeLinkId,
    mainNavbar = document.getElementById('mainNavbar'),
    highestNavBarOrder,
    formBox = document.getElementById('formBox'),
    previousLinkId;


const onClick = (event) => {
    previousLinkId = activeLinkId;
    activeLinkId = event.target.closest('table').id;
    if (previousLinkId == activeLinkId) {
        activeLinkId = undefined;
    }
    NBupdate();
}
const onExtLinkClick =(event) => {
    let url = event.target.closest('table').dataset.url;
    location.href = url;
}
function NBupdate() {
    console.log('updating nb listeners')
    navBarLinksList = document.querySelectorAll('table.link:not(#addLink, .extLink)');
    let externalLinks = document.querySelectorAll('table.extLink');

    console.table(navBarLinksList);
    let activeLink;
    if (activeLinkId) activeLink = document.getElementById(activeLinkId);
    let previousLink;
    if (previousLinkId) previousLink = document.getElementById(previousLinkId);
    
    navBarLinksList.forEach(link => {
        link.addEventListener('click', onClick);
    })

    externalLinks.forEach(link => {
        link.addEventListener('click', onExtLinkClick);
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
    console.log('building nav bar');

    let content;
    if (data) {
        content = data;
    }
    if (!data) {
        content = await readAllFromDatabaseByIndex('orderIndex', undefined, 'linksOS');
    }
    
    mainNavbar.innerHTML = '';
    
    content.forEach((object) => {
        let li = document.createElement('li');
        let icon;
        li.dataset.order = object.order
        if(object.icon && object.type == 'link') {
            icon = `<i class="ti ti-${object.icon}"></i>`;
        } else {
            icon = '';
        }

        li.innerHTML = `
        <table id="${object.ID}" class="${object.type}">
        <tbody>
          <tr>
            <td>${icon}</td>
            <td>${object.name}</td>
          </tr>
        </tbody>
        </table>
        `
        if(editMode && object.type == 'link') {
            li.innerHTML = `
            ${li.innerHTML}
            <table class="editButton" data-editing="${object.ID}">
            <tbody>
                <tr>
                    <td><i class="ti ti-adjustments-horizontal"></i></td>
                </tr>
            </tbody>
            </table>
            `
        }
        if(editMode && object.type == 'title') {
            li.innerHTML = `
            <table id="${object.ID}" class="${object.type}" data-editing="${object.ID}">
            <tbody>
                <tr>
                    <td>${icon}</td>
                    <td>${object.name}</td>
                </tr>
            </tbody>
            </table>
            `
        }
        if (editMode) {
            li.draggable = true
        }

        mainNavbar.appendChild(li);
        highestNavBarOrder = object.order;
    })
    if (editMode) {
        let li = document.createElement('li')
        li.innerHTML = `
        <table id="addLink" class="link">
            <tr>
                <td><i class="ti ti-circle-plus"></i></td>
            </tr>
        </table>`
        mainNavbar.appendChild(li);
    }

    NBupdate();
    if (editMode) {
        editModeUpdate();
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
        
        content = await readAllFromDatabaseByIndex('belongsToIndex', activeLinkId, 'bookmarksOS');
        let activeLink = document.getElementById(activeLinkId)
        
        if (activeLink.classList.contains('predefinedLink')) {
            
            let clone = document.getElementById(`${activeLinkId}Menu`).cloneNode(true);
            contentBox.append(clone);

            if (activeLinkId == 'settings') {
                settingsOpen();
            }
            
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
        const tr = table.insertRow();
        tr.id = 'addBookmark'
        tr.innerHTML = `<td><i class="ti ti-playlist-add"></i></td>`
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
    addToDatabase(link, 'linksOS');
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
    addToDatabase(bookmark, 'bookmarksOS');
    buildTable()

}


const bookmarkEditHandler = async function (event) {

    let key = parseInt(event.target.parentElement.id, 10);
    let oldBookmark = await readFromDatabase(key, 'bookmarksOS');

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
        removeFromDatabase(oldBookmark.ID, 'bookmarksOS')
        buildTable()
        return;
    }
    let newBookmark = oldBookmark;
    newBookmark.name = answers.name;
    newBookmark.link = answers.URL;
    newBookmark.icon = answers.icon;


    editDatabase(newBookmark, 'bookmarksOS');
    buildTable()
}


const linkEditHandler = async function (event) {

    let key = event.target.closest('table').dataset.editing;
    let oldLink = await readFromDatabase(key, 'linksOS');

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
        removeFromDatabase(oldLink.ID, 'linksOS')
        readAllFromDatabaseByIndex('belongsToIndex', oldLink.ID, 'bookmarksOS', removeAllFromDatebase);
        if (oldLink.ID == activeLinkId) {
            activeLinkId = undefined;
        }
        buildNavBar();
        return;
    }
    let newLink = oldLink;
    newLink.name = answers.name;
    newLink.icon = answers.icon;


    editDatabase(newLink, 'linksOS');
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

    const linkEditButtonsList = document.querySelectorAll('table.editButton, table.title');
    linkEditButtonsList.forEach(link => {
        link.addEventListener('click', linkEditHandler);
    })

    linkOrder()
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


function linkOrder() {
    const draggableLinks = document.querySelectorAll("#mainNavbar [draggable='true']");
    
    draggableLinks.forEach(link => {
        link.addEventListener('dragstart', drgStart);
    })
    draggableLinks.forEach(link => {
        link.addEventListener('drop', drgDrop);
    })
    draggableLinks.forEach(link => {
        link.addEventListener('dragover', drgOver);
    })
    draggableLinks.forEach(link => {
        link.addEventListener('dragenter', drgEnter);
    })
    draggableLinks.forEach(link => {
        link.addEventListener('dragleave', drgLeave);
    })

    const addButt = document.getElementById('addLink');
    addButt.addEventListener('dragenter', drgEnter);
    addButt.addEventListener('dragleave', drgLeave);
    addButt.addEventListener('dragover', drgOver);
    addButt.addEventListener('drop', drgDrop);
}
const drgEnter = (event) => {
    event.target.closest('li').classList.add('isBeingDraggedOver');
}
const drgLeave = (event) => {
    event.target.closest('li').classList.remove('isBeingDraggedOver');
}
const drgStart = (event) => {
    event.dataTransfer.setData("order", event.target.dataset.order);
    
    console.log('drag started', event.target.dataset.order);
}
const drgOver = (event) => {
    event.preventDefault();
}
const drgDrop = (event) => {
    event.preventDefault();
    let movedOrder = +event.dataTransfer.getData("order");
    let newOrder;
    if (event.target.closest("li[draggable='true']")) newOrder = +event.target.closest("[draggable='true']").dataset.order;
    if (event.target.closest("table").id == 'addLink') newOrder = highestNavBarOrder+1;
    
    console.log(movedOrder, newOrder);
    event.target.closest('li').classList.remove('isBeingDraggedOver');
    if (movedOrder !== newOrder) {
        reorderLinks(movedOrder, newOrder);
    }
}
async function reorderLinks(movedOrder, newOrder) {
    let movingDown = movedOrder < newOrder;
    let movingUp = movedOrder > newOrder;
    
    if (movingUp) {
        let range = [];
        for (let i = newOrder; i < movedOrder; i++) {
            range.push(i); 
        }
        console.table(range);
        
        let movedLink = await readAllFromDatabaseByIndex('orderIndex', movedOrder, 'linksOS');
        console.log(newOrder)
        movedLink[0].order = newOrder;

        range.forEach(async (order) => {
            let link = await readAllFromDatabaseByIndex('orderIndex', order, 'linksOS');
            link[0].order += 1;
            editDatabase(link[0], 'linksOS');
        })

        editDatabase(movedLink[0], 'linksOS', buildNavBar);
    }

    if (movingDown) {
        let range = [];
        for (let i = newOrder-1; i > movedOrder; i--) {
            range.push(i); 
        }
        console.table(range);

        let movedLink = await readAllFromDatabaseByIndex('orderIndex', movedOrder, 'linksOS');
        console.log(newOrder)
        movedLink[0].order = newOrder-1;

        range.forEach(async (order) => {
            let link = await readAllFromDatabaseByIndex('orderIndex', order, 'linksOS');
            link[0].order -= 1;
            editDatabase(link[0], 'linksOS');
        })

        editDatabase(movedLink[0], 'linksOS', buildNavBar);
    }
}
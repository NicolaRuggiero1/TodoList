let taskAddButton = document.getElementById("task-add-button");
let tasksList = document.getElementById("tasks-list");
let taskContent = document.getElementById("task-content");
let select = document.getElementById("select");
let taskCounter = document.getElementById("task-all-counter");
let taskDoneCounter = document.getElementById("task-done-counter");
let deleteAllButton = document.getElementById("delete-all");
let countAllTask = 0;
let countDoneTask = 0;
const HTTP_RESPONSE_SUCCESS = 200;
const REST_API_ENDPOINT = 'http://localhost:8080';


function updateTasksList() {
    //recupero i dati dal server
    tasksList.innerHTML = "";
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        let JSONresponse = JSON.parse(ajaxRequest.response);
        for(let task of JSONresponse) {
            createTask(task);
        }
    }

    ajaxRequest.open("GET", REST_API_ENDPOINT + '/tasks/');
    
    ajaxRequest.send();
}

/*
 * questa funzione aggiorna la select delle categorie interrogando il server attraverso ajax
 * verrà invocata subito dopo il completo caricamento della pagina 
 */
function updateCategoriesList() {
    //mi crea un oggetto di tipo xmlhttprequest per gestire la chiamata ajax al server
    let ajaxRequest = new XMLHttpRequest();

    //gestisco l'onload: ovvero quello che succede dopo che il server mi risponde
    ajaxRequest.onload = function() {
        //mi salvo tutte le categorie ritornate dal server in una variabile 
        //denominata categories parsando il contenuto della risposta in json
        let categories = JSON.parse(ajaxRequest.response)

        //cicliamo sull array categories
        for(let category of categories) {
            //creiamo un elemento di tipo option
            let newOption = document.createElement("option");

            //assegniamo alla option il valore e il testo prendendolo dalla categoria
            newOption.value = category.id;
            newOption.innerText = category.name

            //appendiamo l'option alla select
            select.appendChild(newOption);
        }
    }

    //setto il method all'indirizzo per la request
    ajaxRequest.open("GET", REST_API_ENDPOINT + '/categories/all');

    //invio la request
    ajaxRequest.send();
}

updateCategoriesList();

function createTask(task) {
    let newTaskLine = document.createElement("div");
    newTaskLine.classList.add("newTask");
    newTaskLine.classList.add("col-sm-12");
    newTaskLine.setAttribute("data-id", task.id);
    let categorySpan = document.createElement("span");
    categorySpan.classList.add("category");
    newTaskLine.appendChild(categorySpan);
    if(task.category) {
        newTaskLine.classList.add(task.category.color);
    }
    
    let doneCheck = document.createElement("i");
    doneCheck.setAttribute("class", "icon-checkmark2");
    if(task.done) {
        countDoneTask++;
        newTaskLine.classList.add("task-done");
        doneCheck.checked = true;
        doneCheck.classList.remove("icon-checkmark2");
        doneCheck.classList.add("icon-checkmark")
    }
    doneCheck.classList.add("checkbox");
    newTaskLine.appendChild(doneCheck);
    let nameSpan = document.createElement("span");
    nameSpan.innerText = task.name;
    newTaskLine.appendChild(nameSpan);
    let dateSpan = document.createElement("span");
    dateSpan.classList.add("date");
    let date = new Date(task.created);
    dateSpan.innerText = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    newTaskLine.appendChild(dateSpan);
    tasksList.appendChild(newTaskLine);
    let trash = document.createElement("button");
    trash.classList.add("icon-bin");
    trash.classList.add("trash");
    newTaskLine.appendChild(trash);

    trash.onclick = function() {
        deleteTask(task.id, newTaskLine);
    }

    
    doneCheck.addEventListener("click", function() {
        task.done = !task.done;
        let taskContent = {
            done: task.done,
            name: task.name
        }
        setDone(task.id, taskContent, () => {
            newTaskLine.classList.toggle("task-done");
            if(doneCheck.classList.contains("icon-checkmark2")) {
                doneCheck.classList.remove("icon-checkmark2");
                doneCheck.classList.add("icon-checkmark");
            } else {
                doneCheck.classList.remove("icon-checkmark");
                doneCheck.classList.add("icon-checkmark2");
            }
            
            editSpan.style.visibility = task.done? "hidden": "visible";
            taskDoneCounter.innerHTML = task.done? ++countDoneTask : --countDoneTask;
    
        });
    });

    
    let editSpan = document.createElement("button");
    editSpan.classList.add("edit");
    editSpan.classList.add("icon-pencil");
    editSpan.style.visibility = task.done? "hidden": "visible";
    //editSpan.innerText = "EDIT";
    newTaskLine.appendChild(editSpan);
    editSpan.addEventListener("click", function() {
        let input  = document.createElement("input");
            input.value = nameSpan.textContent;
            input.setAttribute("id", "edit-input-" + task.id);
        if(newTaskLine.classList.contains("editing")) {
            //chiamata ajax per aggiornare il record
            let up = document.getElementById("edit-input-" + task.id);

            let taskContent = {
                done: task.done,
                name: up.value
            }
            
            updateTask(task.id, taskContent, () => {
                task.name = up.value;
                //sostituisco l'input con uno span contenente il testo aggiornato
                nameSpan.innerText = up.value;
                up.replaceWith(nameSpan);
                //sostituisco il dischetto con la pennina
                editSpan.classList.remove("icon-floppy-disk");
                editSpan.classList.add("icon-pencil");
                //rimuovo la classe editing
                newTaskLine.classList.remove("editing");
                doneCheck.style.visibility = "visible";

            });
            
        } else {
            //sostiuisco lo span con l'input
            
            nameSpan.replaceWith(input);
            //sostituisco la pennetta con il dischetto 
            editSpan.classList.remove("icon-pencil");
            editSpan.classList.add("icon-floppy-disk");

            //aggiungo la classe editing
            newTaskLine.classList.add("editing");
            doneCheck.style.visibility = "hidden";
        }
        
    });
    
    countAllTask++;
    taskCounter.innerHTML = countAllTask;
    taskDoneCounter.innerHTML = countDoneTask;

}


updateTasksList();

function saveTask(taskToSave, successFullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        if(ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            let savedTask = JSON.parse(ajaxRequest.response);
        
            createTask(savedTask);
            successFullCallback();
        }
    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    //dal momento che il server è di tipo REST-full utilizza il tipo json per scambiare informazioni con il front-end.
    //per tanto il server si aspetterà dei dati in formato json e NON considererà richieste
    // in cui il formato non è specificato nella header della richiesta stessa.
    ajaxRequest.setRequestHeader("content-type", "application/json");

    let body = {
        name: taskToSave.name,
        category: {
            id: taskToSave.categoryId
        },
        created: new Date()
        
    };
    ajaxRequest.send(JSON.stringify(body));
}

function setDone(taskId, taskContent, successFullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        successFullCallback();

    }
    
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/set-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");

    ajaxRequest.send(JSON.stringify(taskContent));
}

function updateTask(taskId, taskContent, successFullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        if(ajaxRequest.status == HTTP_RESPONSE_SUCCESS) {
            successFullCallback();
        }
    }
    
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");

    ajaxRequest.send(JSON.stringify(taskContent));
}

function editTask(taskId, taskContent, taskHtmlElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        saveTask(taskContent)
    }
    
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");

    ajaxRequest.send(JSON.stringify(taskContent));
}

function deleteTask(taskId, taskElement) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        if (ajaxRequest.response == "ok") {
            taskElement.remove();
            countAllTask--;
            taskCounter.innerHTML = countAllTask;
            if(taskElement.classList.contains("task-done")) {
                countDoneTask--;
                taskDoneCounter.innerHTML = countDoneTask;
            }
        }
    }
    
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.send();

}

taskAddButton.addEventListener("click", function() {
    //creao una variabile che contiene il valore inserito nell'input nel task (es. comprare il latte);
    let taskContentValue = taskContent.value;
    let taskCategory = select.value;

    //se il valore inserito è vuoto... 
    if (taskContentValue.length < 1) {

        //lancio un messaggio all'utente che deve inserire un task;
        alert("inserire un task");

        //ed esco dalla funzione con return;
        return;
    }

    if(!taskCategory) {
        alert("scegli una categoria");
        return;
    }
    //mi creo un oggetto che rappresenta il task da aggiungere...
    let task = {
        name: taskContentValue,
        categoryId: select.value,
        categoryName: select.textContent          
    };
    //se la variabile che contiene il valore non è vuota, la passo alla funzione saveTask che si occuperà di salvarlo nel database
    saveTask(task, () => {
        taskContent.value = "";
    });
});

deleteAllButton.onclick = function() {
    
    deleteAll(()=> {
        tasksList.innerHTML =  "";
        countAllTask.innerHTML = 0;
        countDoneTask.innerHTML = 0;
    });
}

function deleteAll(successFullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function() {
        if(ajaxRequest.response == "ok") {
            successFullCallback();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/all");
    ajaxRequest.send();
}




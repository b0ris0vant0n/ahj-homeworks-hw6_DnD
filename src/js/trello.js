import Card from "./card";

export default class Trello {
  constructor() {
    this.trello = null;
    this.newPlace = null;

    this.tasksTodo = [];
    this.tasksInProgress = [];
    this.tasksDone = [];
    this.tasks = [this.tasksTodo, this.tasksInProgress, this.tasksDone];
    this.addInput = this.addInput.bind(this);
    this.closeForm = this.closeForm.bind(this);
    this.addNewTask = this.addNewTask.bind(this);
    this.onTaskEnter = this.onTaskEnter.bind(this);
    this.removeTask = this.removeTask.bind(this);
    this.saveListOfTasks = this.saveListOfTasks.bind(this);
    this.loadListOfTasks = this.loadListOfTasks.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.drawSavedTasks = this.drawSavedTasks.bind(this);
    this.showPossiblePlace = this.showPossiblePlace.bind(this);
    this.handleTaskEvent = this.handleTaskEvent.bind(this);
  }

  init() {
    this.loadListOfTasks();
    this.drawTrello();
    this.drawSavedTasks();
    const addList = this.trello.querySelectorAll(".column__add");
    [...addList].forEach((el) => el.addEventListener("click", this.addInput));
    window.addEventListener("beforeunload", this.saveListOfTasks);
  }

  loadListOfTasks() {
    const previouslySaved = localStorage.getItem("tasks");

    if (previouslySaved !== null) {
      this.tasks = JSON.parse(previouslySaved);
    }
  }

  saveListOfTasks() {
    this.tasksTodo = [];
    this.tasksInProgress = [];
    this.tasksDone = [];

    const todo = this.trello.querySelector(".todo");
    const inProgress = this.trello.querySelector(".in-progress");
    const done = this.trello.querySelector(".done");

    const tasksTodo = [...todo.querySelectorAll(".task")];
    const tasksInProgress = [...inProgress.querySelectorAll(".task")];
    const tasksDone = [...done.querySelectorAll(".task")];

    tasksTodo.forEach((task) => this.tasksTodo.push(task.textContent));
    tasksInProgress.forEach((task) => this.tasksInProgress.push(task.textContent));
    tasksDone.forEach((task) => this.tasksDone.push(task.textContent));

    this.tasks = [this.tasksTodo, this.tasksInProgress, this.tasksDone];

    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  drawTrello() {
    this.trello = document.createElement("section");
    this.trello.classList.add("trello");
    this.trello.innerHTML = `<div class="column">
    <h2 class="column__header">todo</h2>
    <ul class="tasks-list todo"></ul>
    <div class="column__add">+ Add another card</div>
  </div>
  <div class="column">
    <h2 class="column__header">in progress</h2>
    <ul class="tasks-list in-progress"></ul> 
    <div class="column__add">+ Add another card</div>
  </div>
  <div class="column">
    <h2 class="column__header">done</h2>
    <ul class="tasks-list done"></ul>
    <div class="column__add">+ Add another card</div>
  </div>
  `;

    document.querySelector("body").appendChild(this.trello);
  }

  drawSavedTasks() {
    const parents = [".todo", ".in-progress", ".done"];

    for (let i = 0; i < parents.length; i += 1) {
      const parent = this.trello.querySelector(parents[i]);

      this.tasks[i].forEach((item) => {


        new Card(parent, item).addTask();

        if (i === 0) {
          this.tasksTodo.push(item);
        }
        if (i === 1) {
          this.tasksInProgress.push(item);
        }
        if (i === 2) {
          this.tasksDone.push(item);
        }
      });

      this.addListeners();
    }
  }

  addInput(event) {
    const newCardForm = document.createElement("form");
    newCardForm.classList.add("column__add-form");
    newCardForm.innerHTML = `
    <textarea class="add-form__textarea" type ="text" placeholder="Enter a task for this card"></textarea>
    <div class="add-form__form-control">
      <button class="add-form__submit-button add-form__button">Add card</button>
      <button class="add-form__close-button add-form__button">X</button>
    </div>
 `;
    const closestColumn = event.target.closest(".column");

    event.target.replaceWith(newCardForm);

    const add = closestColumn.querySelector(".add-form__submit-button");
    const close = closestColumn.querySelector(".add-form__close-button");

    add.addEventListener("click", this.addNewTask);
    close.addEventListener("click", this.closeForm);
  }

  closeForm(event) {
    event.preventDefault();
    const columnAdd = document.createElement("div");
    columnAdd.classList.add("column__add");
    columnAdd.textContent = "+ Add another card";

    const parent = event.target.closest(".column");
    const child = parent.querySelector(".column__add-form");
    parent.removeChild(child);
    parent.appendChild(columnAdd);
    columnAdd.addEventListener("click", this.addInput);
  }

  addNewTask(event) {
    event.preventDefault();
    const closestColumn = event.target.closest(".column");
    const parent = closestColumn.querySelector(".tasks-list");
    const task = closestColumn.querySelector(".add-form__textarea").value;


    new Card(parent, task).addTask();

    const columnAdd = document.createElement("div");
    columnAdd.classList.add("column__add");
    columnAdd.textContent = "+ Add another card";

    closestColumn.removeChild(
    closestColumn.querySelector(".column__add-form")
    );
    closestColumn.appendChild(columnAdd);
    columnAdd.addEventListener("click", this.addInput);

      this.addListeners();
    }
  

  addListeners() {
      this.trello.addEventListener("mouseover", this.handleTaskEvent);
      this.trello.addEventListener("mouseleave", this.handleTaskEvent);
      this.trello.addEventListener("mousedown", this.handleTaskEvent);
    }

  handleTaskEvent(event) {
      const target = event.target;
      const task = target.closest(".task");
      
      if (!task) return;
    
      switch (event.type) {
        case "mouseover":
          this.onTaskEnter(event, task);
          break;
        case "mouseleave":
          this.onTaskLeave(event, task);
          break;
        case "mousedown":
          this.mouseDown(event, task);
          break;
      }
    }
    

  removeTask(event) {
    const task = event.target.closest(".task");
    const parent = event.target.closest(".tasks-list");

    task.parentNode.removeChild(task);

  }

  onTaskEnter(event, task) {
    if (!task.querySelector(".close")) {
      const closeEl = document.createElement("div");
      closeEl.classList.add("tasks-list__close");
      closeEl.classList.add("close");
  
      task.appendChild(closeEl);
      closeEl.style.top = `${closeEl.offsetTop - closeEl.offsetHeight / 2}px`;
      closeEl.style.left = `${task.offsetWidth - closeEl.offsetWidth - 3}px`;
  
      closeEl.addEventListener("click", this.removeTask);
    }
  }
  
  onTaskLeave(event, task) {
    const closeEl = task.querySelector(".close");
    if (closeEl) {
      task.removeChild(closeEl);
    }
  }
  

  updateCardPosition(ghostEl, top, left) {
    ghostEl.style.top = `${top}px`;
    ghostEl.style.left = `${left}px`;
  }
  

  mouseDown(event, task) {
    if (!task) return;
    this.draggedEl = task;
    this.ghostEl = task.cloneNode(true);
    this.ghostEl.removeChild(this.ghostEl.querySelector(".close"));
    this.ghostEl.classList.add("dragged");
    this.ghostEl.classList.add("ghost");
    this.ghostEl.style.width = `${this.draggedEl.offsetWidth}px`;
    this.ghostEl.style.height = `${this.draggedEl.offsetHeight}px`;
    document.body.appendChild(this.ghostEl);
  
    this.top = event.pageY - this.draggedEl.getBoundingClientRect().top;
    this.left = event.pageX - this.draggedEl.getBoundingClientRect().left;
  
    requestAnimationFrame(() => this.initDrag(event));
  }

  initDrag(event) {
    this.ghostEl.style.top = `${event.pageY - this.top}px`;
    this.ghostEl.style.left = `${event.pageX - this.left}px`;

    this.trello.addEventListener("mousemove", this.dragMove);
    document.addEventListener("mouseover", this.showPossiblePlace);
    document.addEventListener("mouseup", this.mouseUp);
  }

  dragMove(event) {
    event.preventDefault();
    if (!this.draggedEl) {
      return;
    }
  
    const { pageX, pageY } = event;
    const top = pageY - this.top;
    const left = pageX - this.left;
  
    this.updateCardPosition(this.ghostEl, top, left);
  
    requestAnimationFrame(() => this.dragMove(event));
  }
  
  mouseUp() {
    if (!this.draggedEl) {
      return;
    }
  
    this.trello.removeEventListener("mousemove", this.dragMove);
    document.removeEventListener("mouseover", this.showPossiblePlace);
    document.removeEventListener("mouseup", this.mouseUp);
  
    if (this.newPlace) {
      this.newPlace.parentNode.replaceChild(this.draggedEl, this.newPlace);
    }
  
    this.draggedEl.style.display = "flex";
    document.body.removeChild(document.body.querySelector(".dragged"));
  
    this.ghostEl = null;
    this.draggedEl = null;
    this.clearGhost();
  }
  
  clearGhost() {
    if (this.ghostEl) {
      this.ghostEl.style.display = "none";
      document.body.removeChild(this.ghostEl);
      this.ghostEl = null;
    }
  }

  showPossiblePlace(event) {
    event.preventDefault();
    if (!this.draggedEl) {
      return;
    }
  
    const closestColumn = event.target.closest(".tasks-list");
  
    if (closestColumn) {
      const allTasks = closestColumn.querySelectorAll(".task");
      const allPos = [closestColumn.getBoundingClientRect().top];
  
      if (allTasks) {
        for (const item of allTasks) {
          allPos.push(item.getBoundingClientRect().top + item.offsetHeight / 2);
        }
      }
  
      if (!this.newPlace) {
        this.newPlace = document.createElement("div");
        this.newPlace.classList.add("task-list__new-place");
      }
  
      this.newPlace.style.width = `${this.ghostEl.offsetWidth}px`;
      this.newPlace.style.height = `${this.ghostEl.offsetHeight}px`;
  
      const itemIndex = allPos.findIndex((item) => item > event.pageY);
      if (itemIndex !== -1) {
        closestColumn.insertBefore(this.newPlace, allTasks[itemIndex - 1]);
      } else {
        closestColumn.appendChild(this.newPlace);
      }
    }
  }
}  
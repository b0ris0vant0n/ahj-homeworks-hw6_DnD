export default class Card {
    constructor(parent, task) {
      this.parent = parent;
      this.task = task;
    }
  
    addTask() {
      const cardElement = document.createElement("li");
      cardElement.classList.add("tasks-list__item");
      cardElement.classList.add("task");
      cardElement.textContent = this.task;
  
      this.parent.appendChild(cardElement);
    }
  }
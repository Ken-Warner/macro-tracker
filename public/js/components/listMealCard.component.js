const listMealCardTemplate = document.createElement('template');
listMealCardTemplate.innerHTML = `
<style>
    div.grid-container {
        display: grid;
        grid-template-areas:
            'name cals prot img'
            'name carbs fats img'
            'description serving serving img';
        grid-template-columns: auto 80px 80px 35px;
        border-bottom: 2px solid black;
    }
    div.name {
        font-size: 24px;
        grid-area: name;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 5px;
    }
    div.description {
        grid-area: description;
        padding-right: 5px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: right;
    }

    div.img {
        grid-area: img;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 5px;
    }

    div.serving { grid-area: serving; }
    
    .cals { grid-area: cals;}
    .prot { grid-area: prot; }
    .carbs { grid-area: carbs; }
    .fats { grid-area: fats; }

    .border-bottom { border-bottom: 2px solid black; }
    .border-left { border-left: 2px solid black; }
    .border-top { border-top: 2px solid black; }

    div.meal-component {
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: hidden;
        white-space: nowrap;
        
        border-right: 2px solid black;
    }
    svg {
        width: 35px;
        height: 35px;
    }

</style>
<div class="grid-container">
    <div class="name"><slot name="mealName"></slot></div>
    <div class="description"><slot name="mealTime"></slot></div>
    <div class="serving meal-component border-left border-top"><slot name="servingSize"></slot></div>
    <div class="cals meal-component border-left"><slot name="calories"></slot>cals</div>
    <div class="prot meal-component"><slot name="protein"></slot>prot</div>
    <div class="carbs meal-component border-top border-left"><slot name="carbs"></slot>carbs</div>
    <div class="fats meal-component border-top"><slot name="fats"></slot>fats</div>
    <div class="img">
    <svg width="800px" height="800px" viewBox="0 0 16 16" fill="none"><path fill="#991818"
        fill-rule="evenodd" d="M1 3.139C1 1.958 1.958 1 3.139 1h9.722C14.042 1 15 1.958 15 3.139v9.722A2.139 2.139
        0 0112.861 15H3.14A2.139 2.139 0 011 12.861V3.14zm4.28 1.08A.75.75 0 004.22 5.28L6.94 8l-2.72 2.72a.75.75 0
        101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" clip-rule="evenodd"/>
    </svg>
    </div>
</div>
`;

class ListMealCard extends HTMLElement {
    constructor(mealData) {
        super();

        this.dataset.userMealId = mealData.user_meal_id;
        this.dataset.mealId = mealData.meal_id;

        const shadow = this.attachShadow({
            mode: 'open',
        });

        shadow.append(listMealCardTemplate.content.cloneNode(true));
        
        shadow.querySelector('[name="mealName"]')
            .appendChild(document.createTextNode(mealData.name));
        shadow.querySelector('[name="calories"]')
            .appendChild(document.createTextNode(mealData.cal_per_serv));
        shadow.querySelector('[name="protein"]')
            .appendChild(document.createTextNode(mealData.prot_per_serv));
        shadow.querySelector('[name="carbs"]')
            .appendChild(document.createTextNode(mealData.carbs_per_serv));
        shadow.querySelector('[name="fats"]')
            .appendChild(document.createTextNode(mealData.fats_per_serv));

            let mealTime = new Date(mealData.meal_time);
            let hours = mealTime.getUTCHours();
            let minutes = mealTime.getUTCMinutes();
            let amFlag = (hours >= 12) ? false : true;
        if (hours > 12) {
            hours = hours - 12;
        } else {
            hours = (hours == 0)? 12 : hours;
        }

        let timeForCard = `${hours}:${minutes}${(amFlag)?'am':'pm'}`;

        shadow.querySelector('[name="mealTime"]')
            .appendChild(document.createTextNode(timeForCard));

        shadow.querySelector('[name="servingSize"]')
            .appendChild(document.createTextNode(`${mealData.serving_size} ${(mealData.serving_size == 1)?'serving':'servings'}`));

        this.addEventListener("click", this.onClick);
        // this.addEventListener("touchstart", this.onTouchStart);
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

    }

    async onClick(e) {
      const apiResult = await fetch(`/meals/deleteListEntry/${this.dataset.userMealId}`, {
        method: 'DELETE',
      });
      
      if (apiResult.status == 200) {
        removeMealFromListContainer(this.dataset.userMealId);
      } else {
        makeToast(`Server Error: Unable to delete ${this.dataset.userMealId}`);
      }
    }

    onTouchStart(e) {
        console.log(e);
    }
}

customElements.define('list-meal-card', ListMealCard);
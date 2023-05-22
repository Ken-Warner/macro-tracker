const addMealCardTemplate = document.createElement('template');
addMealCardTemplate.innerHTML = `
<style>
    div.grid-container {
        display: grid;
        grid-template-areas:
            'name cals prot img'
            'name carbs fats img'
            'description description description img';
        grid-template-columns: auto 80px 80px 35px;
        border-bottom: 2px solid black;
        border-top: 2px solid black;
    }
    div.name {
        font-size: 24px;
        grid-area: name;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 5px;
    }
    div.img {
        grid-area: img;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 5px;
    }

    div.description {
        grid-area: description;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding-left: 5px;
    }

    .cals { grid-area: cals; }
    .prot { grid-area: prot; }
    .carbs { grid-area: carbs; }
    .fats { grid-area: fats; }

    .border-left { border-left: 2px solid black; }
    .border-top { border-top: 2px solid black; }
    .border-bottom { border-bottom: 2px solid black; }

    div.macro {
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
    <div class="description"><slot name="mealDescription"></slot></div>
    <div class="cals macro border-bottom border-left"><slot name="calories"></slot>cals</div>
    <div class="prot macro border-bottom"><slot name="protein"></slot>prot</div>
    <div class="carbs macro border-bottom border-left"><slot name="carbs"></slot>carbs</div>
    <div class="fats macro border-bottom"><slot name="fats"></slot>fats</div>
    <div class="img">
        <svg width="800px" height="800px" viewBox="0 0 16 16"  fill="none">
            <path fill="#090" fill-rule="evenodd" d="M3.25 1A2.25 2.25 0 001 3.25v9.5A2.25 2.25 0 003.25 15h9.5A2.25 2.25
            0 0015 12.75v-9.5A2.25 2.25 0 0012.75 1h-9.5zm7.47 4.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-2-2a.75.75
            0 011.06-1.06l1.47 1.47 3.97-3.97z" clip-rule="evenodd"/>
        </svg>
    </div>
</div>
`;

class AddMealCard extends HTMLElement {
    constructor(mealData) {
        super();

        this.mealCardData = mealData;

        const shadow = this.attachShadow({
            mode: 'open',
        });

        shadow.append(addMealCardTemplate.content.cloneNode(true));
        
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
        shadow.querySelector('[name="mealDescription"]')
            .appendChild(document.createTextNode(mealData.description));

        this.addEventListener("click", this.onClick);
    }

    get MealCardData() {
        return this.mealCardData;
    }

    static get observedAttributes() {
        return [];
    }

    attributeChangedCallback(name, oldValue, newValue) {

    }

    connectedCallback() {

    }

    onClick(e) {
        showModalWindow(this.MealCardData);
    }
}

customElements.define('add-meal-card', AddMealCard);
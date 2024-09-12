{
  /* <input id="pizza" />
<button>Add Pizza</button>
<ul></ul> */
}
const button = document.querySelector("button");
const input = document.querySelector("#pizza");

class PizzaStore extends EventTarget {
  pizzas = [];
  constructor() {
    super();
  }
  addPizza(flavor) {
    this.pizzas.push(flavor);
    // fire event directly on the class
    this.dispatchEvent(
      new CustomEvent("pizzaAdded", {
        detail: {
          pizza: flavor,
        },
      })
    );
  }
}
const pizzas = new PizzaStore();

const handleClick = () => {
  pizzas.addPizza(input.value);
  input.value = "";
};

button.onclick = handleClick;

pizzas.addEventListener("pizzaAdded", (e) => {
  console.log("Added Pizza:", e.detail.pizza);
  console.log("all pizzas:", pizzas.pizzas);
});
pizzas.addPizza("supreme");

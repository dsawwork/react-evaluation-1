const API = (() => {
  const URL = "http://localhost:3000";
  const inventoryURL = "/inventory";
  const cartURL = "/cart";
  const getCart = () => {
    // define your method to get cart data
    const baseURL = URL + cartURL;
    return fetch(baseURL).then((res) => res.json());
  };

  const getInventory = () => {
    // define your method to get inventory data
    const baseURL = URL + inventoryURL;
    return fetch(baseURL).then((res) => res.json());

  };



  const addToCart = (inventoryItem) => {
    // define your method to add an item to cart
    return fetch(URL+cartURL , {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryItem),
    }).then((res) => res.json());
  };

  const updateCart = (item) => {
    return fetch(URL+cartURL+ `/${item.id}` , {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    }).then((res) => res.json());
    // define your method to update an item in cart
  };

  const deleteFromCart = (id) => {
    // define your method to delete an item in cart
    return fetch(`${URL+cartURL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  };

  const checkout = () => {
    // you don't need to add anything here
    return getCart().then((data) =>
      Promise.all(data.map((item) => deleteFromCart(item.id)))
    );
  };

  return {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const Model = (() => {
  // implement your logic for Model
  class State {
    #onChange;
    #onInventoryChange;
    #inventory;
    #cart;
    constructor() {
      this.#inventory = [];
      this.#cart = [];
    }
    get cart() {
      return this.#cart;
    }

    get inventory() {
      return this.#inventory;
    }

    set cart(newCart) {
      this.#cart = newCart.map((item) => {
        return {count: item.count || 0, ...item};
      } );

      this.#onChange("cart");
    }

    set inventory(newInventory) {

      this.#inventory = newInventory.map((item) => {
        return {count: item.count || 0, ...item};
      } );

      this.#onChange("inventory");
    }

    subscribe(cb) {
      this.#onChange = cb;

    }
  }
  const {
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  } = API;
  return {
    State,
    getCart,
    updateCart,
    getInventory,
    addToCart,
    deleteFromCart,
    checkout,
  };
})();

const View = (() => {
  const inventorylistEl = document.querySelector(".inventory-wrapper");
  const cartlistEl = document.querySelector(".cart-wrapper");
  const inventoryAddBtn = document.querySelector(".inventory__add-btn");
  const inventoryRemoveBtn = document.querySelector(".inventory__remove-btn");
  const cartDeleteBtn = document.querySelector(".deletecart_btn");
  // implement your logic for View
  const addRemoveBtn = document.querySelector(".addcart_btn");
  const renderInventory = (items) => {
    let inventoryTemp = "";

    items.forEach((item) => {
      const itemTemp = `<li id=${item.id}>
       <span>${item.content}</span>
      <button class="inventory__remove-btn">-</button>
      <span class="inventory__count">${item.count || 0}</span>
      <button class="inventory__add-btn">+</button>
      <button class="addcart_btn"> Add Cart </button>
    </li>`;
    inventoryTemp += itemTemp;
    });

    inventorylistEl.innerHTML = inventoryTemp;
  };

  const renderCart = (items) => {
    let renderTemp = "";

    items.forEach((item) => {
      const itemTemp = `<li id=${item.id}>
       <span>${item.content + ' x '}</span>
      <span>${item.count || 0}</span>
      <button class="deletecart_btn">Delete</button>
    </li>`;
    renderTemp += itemTemp;
    });

    renderTemp += `<button class="checkout-btn">checkout</button>`;
    cartlistEl.innerHTML = renderTemp;
  };

  
  
  return {
    inventorylistEl,
    cartlistEl,
    cartDeleteBtn,
    inventoryAddBtn,
    inventoryRemoveBtn,
    addRemoveBtn,
    renderInventory,
    renderCart
    
  };
})();

const Controller = ((model, view) => {
  // implement your logic for Controller
  const state = new model.State();
  const handleUpdateAmount = (updateitem) => {
    Model.updateCart(updateitem);

  };

  const handleAddToCart = (updateitem) => {
    Model.addToCart(updateitem);

  };

  const handleDelete = (id) => { 

    Model.deleteFromCart(id);

  };

  const handleCheckout = () => {
    Model.checkout();

  };
  const setUpHandler = () => {
    view.inventorylistEl.addEventListener("click", (event) => {
      const element = event.target;
      // console.log(element.className);
       // only update state of inventory
      if (element.className === "inventory__remove-btn") {
       
        const id = element.parentElement.getAttribute("id");
        const inventoryList = state.inventory;
        state.inventory = inventoryList.map((item) => item.id === Number.parseInt(id) && item.count > 0 ? {count: item.count - 1 ,id: item.id, content: item.content} : item);
          
      }
  
      if (element.className === "inventory__add-btn") {
        // only update state of inventory
        const id = element.parentElement.getAttribute("id");
        const inventoryList = state.inventory;
        state.inventory = inventoryList.map((item) => item.id === Number.parseInt(id) ? {count: item.count + 1 ,id: item.id, content: item.content} : item);
          
      }

      if (element.className === "addcart_btn") {
        // only update state of inventory
        const id = Number.parseInt(element.parentElement.getAttribute("id"));
        const item = state.inventory.find((item) => {return item.id === id;});
        const currentCart = state.cart.find((item) => {return item.id == id});
        const addItem = {id: Number.parseInt(id), changecount: item.count }
        if (item.count == 0) {
          // delete item
        } else if (currentCart) {
          // adjust item
          let newitem = {id: item.id, count: item.count + currentCart.count, content: item.content};
          handleUpdateAmount(newitem);
        } else {
          handleAddToCart(item);
        }
        
        // const inventoryList = state.inventory;
        // state.inventory = inventoryList.map((item) => item.id === Number.parseInt(id) ? {count: item.count + 1 ,id: item.id, content: item.content} : item);
          
      }
    
    });

    view.cartlistEl.addEventListener('click', (event) => {
      const element = event.target;
      if (element.className === "deletecart_btn") {
       
        const id = element.parentElement.getAttribute("id");
        handleDelete(id);
      }

      if (element.className === "checkout-btn") {
        handleCheckout();
      }
    })
  };




  // view.inventoryAddBtn.addEventListener("click", (event) => {
  //   const element = event.target;
  //   // console.log(element.className);
  //   // if (element.className === "todo__delete-btn") {
  //   //   const id = element.parentElement.getAttribute("id");
  //   //   // model.deleteTodo(id).then(() => {
  //   //   //   state.todos = state.todos.filter((todo) => todo.id !== id);
  //   //   // });
  //   //   model
  //   //     .deleteTodo(id)
  //   //     .then(() => {
  //   //       return model.getTodos();
  //   //     })
  //   //     .then((data) => {
  //   //       state.todos = data;
  //   //     });
  //   // }
  
  // });



  const bootstrap = () => {
    state.subscribe((type) => {
      if (type == "inventory") {
        view.renderInventory(state.inventory);
      }
      else if (type == "cart") {
        view.renderCart(state.cart);
      }
     
    });
    model.getInventory().then((data) => {
      state.inventory = data;
      view.renderInventory(state.inventory);
    });
    model.getCart().then((data) => {
      state.cart = data;
      view.renderCart(state.cart);
    });
    setUpHandler();
  };



  return {
    bootstrap,
  };
})(Model, View);

Controller.bootstrap();

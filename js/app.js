var app = new Vue({
  el: "#app",
  data: {
    componentLoaded: true,
    toggleStatus: {
      "menu": false,
      "verticalButtons": false,
      "horizButtons": false,
      "walletView": false,
      "shopCartView": false,
      "storyLetter": false,
      "shopListView": false,
      "inventoryView": false
    }, // status for toggle menu
    player: null,
    action: "",
    button: "Go to cashier",
    warnMessage: "", // series of messages for correct/incorrect steps
    activeState: 0, // state to check if the game has already started
    storyState: 0,
    shopState: 0, // state to check the steps involved in shopping item(s)
    paySum: 0, // total price of selected products
    coinSum: 0, // total price of selected coins
    coinChange: 0, // change upon paying the total cost
    shopCartList: [],
    walletCoins: [],
    storyJson: {},
    rulesJson: {},
    shopsJson: {},
    shoppingListsJson: {},
    shopsList: [],
    shopProducts: [],
    productList: [],
    quizObj: null, // instance of a multipleChoice quiz for payment/changes
    lessCoins: false, // bool checker for insufficient coins
    productAddedTimer: false,
    messageShow: false,
    productAddedName: "",
    messageBox: false,
    shopSelected: false,
    muted: false,
    audio: ""
  },
  mounted() {
    document.addEventListener('touchmove', function(event) {
      event = event.originalEvent || event;
      if (event.scale !== 1) {
        event.preventDefault();
      }
    }, { passive: false });

    document.addEventListener("touchstart", event => {
      if (event.touches.length > 1) {
        event.preventDefault();
        event.stopPropagation(); // maybe useless
      }
    }, { passive: false });

    this.readTextFile("media/json/shops.json", function(json) {
      app.shopsJson = JSON.parse(json);
      app.createShops();
    })

    this.readTextFile("media/json/stories.json", function(json) {
      app.storyJson = JSON.parse(json);
    })

    this.readTextFile("media/json/shoppingLists.json", function(json) {
      app.shoppingListsJson = JSON.parse(json);
      var shoppingList = new ShoppingList();
      shoppingList.createList();
      app.player = new Player(shoppingList);
    })

    this.readTextFile("media/json/rules.json", function(json) {
      app.rulesJson = JSON.parse(json);
    })

  },
  methods: {
    readTextFile(file, callback) {
      var rawFile = new XMLHttpRequest();
      rawFile.overrideMimeType("application/json");
      rawFile.open("GET", file, true);
      rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
          callback(rawFile.responseText);
        }
      }
      rawFile.send(null);
    },
    createShops() {
      for (var i = 0; i < this.shopsJson.length; i++) {
        this.shopsList.push(new Shop(this.shopsJson[i], i))
      }
    },
    resetSelectedShops() {
      this.shopSelected = false;
      for (var shop of this.shopsList) {
        shop.selected = false;
      }
    },
    changeAppState() {
      if (this.activeState == 3) {
        this.changeShopsState()
      }
      else {
        switch (this.activeState) {
          case 0:
            if (this.componentLoaded) {
              wallet.addCoins(this.player.money);
              SoundStore.cache["media/wav/begin-game.wav"].play();
              this.button = "Go shopping";
              this.activeState = 1;
              this.muted = false;
            }
            break;
          case 1:
            if (!this.muted) {
              SoundStore.cache["media/wav/correct-step.wav"].play();
            }
            this.button = "Enter shop";
            this.activeState = 2;
            break;
          case 2: // map page
            if (this.player.visits != 0 && this.shopSelected) {
              this.player.visits--;
              this.goToProducts();
              this.activeState = 3;
              if (!this.muted) {
                SoundStore.cache["media/wav/welcome-shop.wav"].play();
              }
            }
            break;
          default:
            break;
        }
      }
    },
    addShopUI(event) {
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
      this.resetSelectedShops();
      var shopIndex = event.currentTarget.dataset.index;
      this.shopsList[shopIndex].selected = true;
      this.productList = this.shopsList[shopIndex].shopProducts;
      shopCart.createShopCart();
      this.shopSelected = true;
    },
    changeShopsState() {
      switch (this.shopState) {
        case 0:
          /* product page */
          if (this.shopCartList.length == 0) {
            // no selected items
            this.openMessage();
          }
          else {
            // selected items
            this.paySum = shopCart.calculateTotal();
            this.quizObj = new Choice("pay", 4, this.paySum);
            this.goToPay();
          }
          break;
        case 1:
          /* quiz for total cost */
          if (this.quizObj.compareAnswers()) {
            // match the right answer with the user selected answer
            this.goToCoins();
          }
          else if (!this.quizObj.playerAnswer) {
            // no selected answer
            this.openMessage();
          }
          else {
            // wrong answer
            this.goToProducts();
            this.openMessage();
            this.resetShop();
          }
          this.quizObj.resetPlayerAnswer();
          break;
        case 2:
          this.coinSum = this.sumSelectedCoins();
          if (this.coinSum == 0) {
            // no selected coins
            this.openMessage();
          }
          else if (this.coinSum >= this.paySum) {
            this.coinChange = this.coinSum - this.paySum;
            this.quizObj = new Choice("receive", 4, this.coinChange);
            this.goToReceive();
          }
          else {
            // insufficient coins handed over
            this.lessCoins = true;
            this.goToProducts();
            this.openMessage();
            this.resetShop();
            wallet.resetSelected();
          }
          this.lessCoins = false;
          break;
        case 3:
          /* quiz for change amount */
          if (this.quizObj.compareAnswers()) {
            // match the right answer with the user selected answer
            wallet.removeSelected();
            wallet.addCoins(this.coinChange);
            this.goToFinish();
          }
          else if (!this.quizObj.playerAnswer) {
            // no selected choices
            this.openMessage();
          }
          else {
            // wrong choice
            this.goToProducts();
            this.openMessage();
            this.resetShop();
          }
          this.quizObj.resetPlayerAnswer();
          wallet.resetSelected();
          break;
        case 4:
          /* finish shopping */
          // redirect to map page
          this.player.updateInventory();
          this.returnToMap();
          break;
        default:
          break;
      }
    },
    endGame() {
      if (this.player.checkWinCond()) {
        this.warnMessage = this.storyJson.ending.success;
        this.messageShow = true;
        this.resetGame();
      }
      else if (this.player.visits == 0) {
        this.warnMessage = this.storyJson.ending.failed;
        this.messageShow = true;
        this.resetGame();
      }
    },
    toggleMenu() {
      if (!this.toggleStatus.menu) {
        this.toggleStatus.menu = true;
        this.toggleStatus.verticalButtons = true;
      }
      else {
        this.resetHoriz();
        this.toggleStatus.menu = false;
      }
    },
    toggleButton(event) {
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
      var elementId = event.currentTarget.id;
      this.toggleStatus.verticalButtons = false;
      if (this.toggleStatus.menu) {
        this.toggleStatus.horizButtons = true;
        switch (elementId) {
          case "toggle-story":
            this.toggleStatus.storyView = true;
            break;
          case "toggle-wallet":
            this.toggleStatus.walletView = true;
            break;
          case "toggle-shop-cart":
            this.toggleStatus.shopCartView = true;
            break;
          case "toggle-shop-list":
            this.toggleStatus.shopListView = true;
            break;
          case "toggle-inventory":
            this.toggleStatus.inventoryView = true;
            break;
          default:
            break;
        }
      }
    },
    horizToggleButtons(event) {
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
      var elementId = event.currentTarget.id;
      if (this.toggleStatus.horizButtons) {
        switch (elementId) {
          case "story":
            this.toggleStatus.storyView = true;
            this.toggleStatus.walletView = false;
            this.toggleStatus.shopCartView = false;
            this.toggleStatus.shopListView = false;
            this.toggleStatus.inventoryView = false;
            break;
          case "my-wallet":
            this.toggleStatus.walletView = true;
            this.toggleStatus.storyView = false;
            this.toggleStatus.shopCartView = false;
            this.toggleStatus.shopListView = false;
            this.toggleStatus.inventoryView = false;
            break;
          case "my-shop-cart":
            this.toggleStatus.shopCartView = true;
            this.toggleStatus.storyView = false;
            this.toggleStatus.walletView = false;
            this.toggleStatus.shopListView = false;
            this.toggleStatus.inventoryView = false;
            break;
          case "my-shop-list":
            this.toggleStatus.shopListView = true;
            this.toggleStatus.storyView = false;
            this.toggleStatus.walletView = false;
            this.toggleStatus.shopCartView = false;
            this.toggleStatus.inventoryView = false;
            break;
          case "my-inventory":
            this.toggleStatus.inventoryView = true;
            this.toggleStatus.shopListView = false;
            this.toggleStatus.storyView = false;
            this.toggleStatus.walletView = false;
            this.toggleStatus.shopCartView = false;
            break;
          default:
            break;
        }
      }
    },
    resetHoriz() {
      this.toggleStatus.horizButtons = false;
      this.toggleStatus.storyView = false;
      this.toggleStatus.walletView = false;
      this.toggleStatus.shopCartView = false;
      this.toggleStatus.shopListView = false;
      this.toggleStatus.inventoryView = false;
    },
    returnToMap() {
      if (!this.muted) {
        SoundStore.cache["media/wav/exit-shop.wav"].play();
      }
      if (this.toggleStatus.menu) {
        this.toggleStatus.menu = false;
      }
      this.resetShop();
      this.button = "Enter shop";
      this.resetSelectedShops();
      this.activeState = 2;
      this.endGame();
    },
    returnToProducts() {
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
      if (this.toggleStatus.menu) {
        this.toggleStatus.menu = false;
      }
      this.goToProducts();
    },
    resetGame() {
      if (!this.muted) {
        SoundStore.cache["media/wav/end-game.wav"].play();
      }

      if (this.toggleStatus.menu) {
        this.toggleStatus.menu = false;
      }

      this.activeState = 0;
      var shoppingList = new ShoppingList();
      shoppingList.createList();
      this.player = new Player(shoppingList);
      this.muted = false;
    },
    resetShop() {
      shopCart.reset();
      this.shopCartList = [];
    },
    resetQuizSelection() {
      // It resets values for the multiple choice questions
      this.quizObj.resetPlayerAnswer();
      this.coinSum = 0;
      this.coinChange = 0;
      wallet.resetSelected();
    },
    selectAnswer(dictionary) {
      // one selected answer will have a different style
      // while it unselects the rest of the choices
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }

      for (var i in this.quizObj.choices) {
        this.quizObj.choices[i].chosen = false;
      }
      dictionary.chosen = true;
      this.quizObj.playerAnswer = dictionary.choiceValue;
    },
    goHome() {
      this.activeState = 2;
      this.button = "Go home";
    },
    goToProducts() {
      this.shopState = 0;
      this.button = "Go to cashier";
    },
    goToPay() {
      this.shopState = 1;
      this.action = this.quizObj.title;
      this.button = "Submit answer";
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
    },
    goToCoins() {
      this.shopState = 2;
      this.button = "Pay coins";
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
    },
    goToReceive() {
      this.shopState = 3;
      this.action = this.quizObj.title;
      this.button = "Submit answer";
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
    },
    goToFinish() {
      this.shopState = 4;
      this.button = "Exit shop";
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
    },
    openMessage() {
      if (this.shopState == 0) {
        if (this.shopCartList.length == 0) {
          this.warnMessage = "Please select an item. Click anywhere to return!";
        }
        else if (this.lessCoins) {
          this.warnMessage = "Not enough coins. Click anywhere to restart the game!";
        }
        else {
          this.warnMessage = "Incorrect answer. Click anywhere to restart the game!";
        }
      }
      else {
        this.warnMessage = "Please select an answer. Click anywhere to return!";
      }
      this.messageShow = true;
      if (!this.muted) {
        SoundStore.cache["media/wav/incorrect-step.wav"].play();
      }
    },
    closeMessage() {
      this.messageShow = false;
    },
    selectCoin(event) {
      if (!this.muted) {
        SoundStore.cache["media/wav/product-click.wav"].play();
      }

      var coinIndex = event.currentTarget.dataset.index;
      app.walletCoins[coinIndex].selected = !app.walletCoins[coinIndex].selected;
    },
    sumSelectedCoins() {
      var total = 0;
      for (var coin of app.walletCoins) {
        if (coin.selected) {
          total += coin.value
        }
      }
      return total;
    },
    addToCart(event) {
      if (!this.muted) {
        SoundStore.cache["media/wav/product-click.wav"].play();
      }
      var index = event.currentTarget.dataset.index
      shopCart.addToShopCart(index)
      this.shopCartList.push(app.productList[index])
    },
    removeFromCart(event) {
      if (this.shopState == 0) {
        if (!this.muted) {
          SoundStore.cache["media/wav/product-click.wav"].play();
        }
        index = event.currentTarget.dataset.index
        shopCart.removeFromShopCart(index)

        length = this.shopCartList.length
        console.log(length)

        for (var i = 0; i < length; i++) {
          if (this.shopCartList[i].index == index) {
            this.shopCartList.splice(i, 1)
            break;
          }
        }
      }
    },
    helpButton() {
      this.warnMessage = this.rulesJson.intro + "<br>" + this.rulesJson.map + "<br>" + this.rulesJson.selectItems + "<br>" + this.rulesJson.payQuiz + "<br>" + this.rulesJson.coinQuiz + "<br>" + this.rulesJson.receiveQuiz;
      this.messageShow = true;
      if (!this.muted) {
        SoundStore.cache["media/wav/correct-step.wav"].play();
      }
    },
    sound() {
      if (this.muted) {
        this.muted = false;
      }
      else {
        this.muted = true;
      }
    },
    addingMessage(event) {
      index = event.currentTarget.dataset.index;
      element = document.getElementById("addingMessage").style;
      element["opacity"] = 1;
      element["transition"] = "0s";
      element["z-index"] = 90;

      this.productAddedName = this.productList[index].name
      if (this.productAddedTimer == false) {
        app.productAddedTimer = true;
        setTimeout(function() {
          element["transition"] = "1s";
          element["opacity"] = 0;
          element["z-index"] = 0;

          app.productAddedTimer = false;
        }, 700);
      }
    },
    //item animation function
    clickAnimation(product) {
      product.animated = true;
    }
  },
});

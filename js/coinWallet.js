var splitter = new function() {
  // It splits the amount of integer given
  // into denominations in the minimum number possible (greedy algorithm)
  // and returns an array of integers (NOT Coin() objects)
  this.splitMoney = function(amountToSplit, denos) {
    var denominations = denos || [1, 2, 5, 10, 20, 50];
    var len = denominations.length;
    var result = [];
    var i = len - 1;
    while (i >= 0) {
      while (amountToSplit >= denominations[i]) {
        amountToSplit -= denominations[i];
        result.push(denominations[i]);
      }
      i--;
    }
    return result;
  }

  // It randomly splits the denominations into smaller ones in an array
  this.splitMore = function(amountToSplit) {
    var arr = this.splitMoney(amountToSplit);
    var denominations = [1, 2, 5, 10, 20, 50];
    var result = [];
    for (var i of arr) {
      var denoIndex = denominations.indexOf(i);
      if (denoIndex != -1) denominations.splice(denoIndex, 1);
      // the smaller the denomination, the lower the probability to split
      // the larget the result array becomes, the lower the probability to split
      if (i >= generic.randomNumber(1, 100 + result.length)) {
        result = result.concat(this.splitMoney(i, denominations));
      }
      else {
        result.push(i);
      }
    }
    return result;
  }

  // It splits the amount of integer given
  // using splitMoneyRandom() function
  // and shuffles the resulting array.
  this.shuffleSplit = function(amountToSplit) {
    return generic.shuffle(this.splitMore(amountToSplit));
  }
}

///////////////////CoinDefiner - iterates throught the an array(created by coin split func) and adds objects of 
///////////////////Coin class 
function Coin(id, value) {
  this.index = id;
  this.value = value;
  this.selected = false; // to toggle selection when clicked

  this.selectImage = function() {
    switch (this.value) {
      default: break;
      case 1:
          return "media/coin/1.png";
      case 2:
          return "media/coin/2.png";
      case 5:
          return "media/coin/5.png";
      case 10:
          return "media/coin/10.png";
      case 20:
          return "media/coin/20.png";
      case 50:
          return "media/coin/50.png";
    }
  }
  this.image = this.selectImage()

  this.showCoin = function() {
    return `<img src="${this.image}"
    class="button-image"></img>`.trim()
  }

}

// walletObj
var wallet = new function() {

  this.addCoins = function(money) {
    var intArray = splitter.shuffleSplit(money)
    var len = intArray.length;
    for (var i = 0; i < len; i++) {
      app.walletCoins.push(new Coin(app.walletCoins.length, intArray[i]));
    }
  }

  this.removeSelected = function() {
    var length = app.walletCoins.length - 1
    for (var i = length; i > -1; i--) {
      if (app.walletCoins[i].selected) {
        app.walletCoins.splice(app.walletCoins[i].index, 1)
      }
    }
    this.resetCoinIndex();
  }

  this.resetCoinIndex = function() {
    var i = 0;
    for (var coin of app.walletCoins) {
      coin.index = i;
      i++;
    }
  }

  this.resetSelected = function() {
    for (var coin of app.walletCoins) {
      coin.selected = false;
    }
  }

}

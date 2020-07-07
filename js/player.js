function Player(shoppingList) {
    this.name = "Jack";
    this.visits = generic.randomNumber(3, 5);
    this.shoppingList = shoppingList;
    this.inventory = [];

    this.updateInventory = function() {
        this.inventory = this.inventory.concat(app.shopCartList);
    }

    //check whether the elements of one array are present in another array
    this.contains = function(array_1, array_2) {
        for (var i = 0; i < array_1.length; i++) {
            if (array_2.indexOf(array_1[i]) == -1) return false;
        }
        return true;
    }

    this.extractProductNames = function(objList, multiplyCount) {
        var tempList = []
        for (var i = 0; i < objList.length; i++) {
            if (objList[i].count && multiplyCount) {
                for (var j = 0; j < objList[i].count; j++) {
                    tempList.push(objList[i].name)
                }
            }
            else {
                tempList.push(objList[i].name)
            }
        }
        return tempList
    }

    this.checkWinCond = function() {
        var inventoryObjNames = this.extractProductNames(this.inventory, true);
        var shopListObjNames = this.extractProductNames(this.shoppingList.currentList, true);

        if (this.contains(shopListObjNames, inventoryObjNames)) {
            return true;
        }
        else {
            return false;
        }
    }

    this.giveMoney = function() {
        var money = 0;

        for (var i = 0; i < app.shopsJson.length; i++) {
            var currentShopProds = app.shopsJson[i].products
            for (var j = 0; j < currentShopProds.length; j++) {
                var shopListObjNames = this.extractProductNames(this.shoppingList.currentList, false);
                var productIndex = shopListObjNames.indexOf(currentShopProds[j].name)

                if (productIndex != -1) {
                    money += currentShopProds[j].price * this.shoppingList.currentList[productIndex].count
                }

            }
        }
        return money + generic.randomNumber(0, 200)
    }
    this.money = this.giveMoney();
}

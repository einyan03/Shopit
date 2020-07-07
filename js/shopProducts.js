function ShopItem(id, name, price, image) {
    this.index = id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.animated = false;

    this.showCartItem = function() {
        return `<img src="${this.image}"
        class="item-image" style="margin: 0;"></img>`.trim()
    }
}

function Shop(shopInfo, i) {
    this.createShopItems = function(products) {
        var tempProducts = [];
        for (var i = 0; i < products.length; i++) {
            var item = new ShopItem(i, products[i].name, products[i].price, products[i].image)
            tempProducts.push(item)
        }
        return tempProducts
    }

    this.index = i;
    this.name = shopInfo.shop;
    this.image = shopInfo.image;
    this.selected = false;
    this.shopProducts = this.createShopItems(shopInfo.products);
}

var shopCart = new function() {
    this.shopCartDict = {};

    this.createShopCart = function() {
        this.shopCartDict = {};
        for (var product of app.productList) {
            this.shopCartDict[product.name] = 0
        }
    }

    this.addToShopCart = function(index) {
        var product = app.productList[index]
        this.shopCartDict[product.name] += 1;
    }

    this.removeFromShopCart = function(index) {
        var product = app.productList[index]
        this.shopCartDict[product.name] -= 1;
    }

    this.reset = function() {
        for (var key in this.shopCartDict) {
            this.shopCartDict[key] = 0
        }
    }

    this.calculateTotal = function() {
        var total = 0;
        var i = 0;
        for (var key in this.shopCartDict) {
            var productAmount = this.shopCartDict[key]
            if (productAmount != 0) {
                var product = app.productList[i];
                total += product.price * productAmount
            }
            i++;
        }
        return total;
    }
}

function ShoppingList() {
	this.currentList = [{ name: "Birthday Cake", count: 1, checked: false }];
	this.json = app.shoppingListsJson;
	this.createList = function() {
		for (var i = 0; i < this.json.length; i++) {
			var arrayProducts = generic.shuffle(this.json[i].products);
			for (var j = 0; j < this.json[i].limit; j++) {
				this.currentList.push(arrayProducts[j]);
			}
		}
	}

	this.resetList = function() {
		this.currentList = [{ name: "Birthday Cake", count: 1 }];
	}
}

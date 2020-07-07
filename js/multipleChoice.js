function Choice(title, numberOfChoices, totalPrice) {
  this.title = title;
  this.quizLength = numberOfChoices;
  this.total = totalPrice;
  this.choices = [{ choiceValue: this.total, chosen: false }];
  this.playerAnswer = null;

  while (this.choices.length < this.quizLength) {
    // add three more random values as the total price alr exists in the arr
    // once it reaches the desired arr length (which is 4), terminate the loop
    var randPrice = generic.randomNumber(0, totalPrice + 10);
    if (!this.choices.some(e => e.choiceValue === randPrice)) {
      this.choices.push({ choiceValue: randPrice, chosen: false });
    }
  }

  generic.shuffle(this.choices);

  this.resetPlayerAnswer = function() {
    this.playerAnswer = null;
  }

  this.compareAnswers = function() {
    return this.playerAnswer == this.total;
  }
}

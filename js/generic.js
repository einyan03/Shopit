/* ---------------------------------------------------------------
    General purpose functions and functions from other sources
--------------------------------------------------------------- */
var generic = new function() {
  // It returns a random integer between min and max values
  this.randomNumber = function (min, max) {  
      min = Math.ceil(min); 
      max = Math.floor(max); 
      return Math.floor(Math.random() * (max - min + 1)) + min; 
  }
  
  // Fisher-Yates shuffle (https://bost.ocks.org/mike/shuffle/)
  this.shuffle = function (array) {
    var l = array.length, temp, rand;
    while (l) {
      rand = Math.floor(Math.random() * l--);
      temp = array[l];
      array[l] = array[rand];
      array[rand] = temp;
    }
    return array;
  }
  
  this.countElement = function (elementToCount, array) {
    var total = 0;
    for (var i in array) {
      if (array[i] == elementToCount) {
        total++;
      }
    }
    return total;
  }
  
  this.sumArray = function(array) {
    var total = 0;
    for (var i of array) {
      total += i;
    }
    return total;
  }
  
}
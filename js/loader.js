var SoundStore = new function() {
  this.cache = {}; // cache of data
  this.numberOfFiles = 0;
  this.ac = new AudioContext();
  this.successCount = 0;
  this.errorCount = 0;
  this.imageExtensions = ["png", "jpg", "gif"],
    this.fontExtensions = ["ttf", "otf", "ttc", "woff"],
    this.jsonExtensions = ["json"],
    this.audioExtensions = ["mp3", "ogg", "wav", "webm"],
    this.loaddata = function(data) {
      var that = this;
      return new Promise(function(resolve) {
        var loadHandler = function() {
          that.successCount += 1;
          if (that.numberOfFiles === that.successCount) {
            that.successCount = 0;
            that.numberOfFiles = 0;
            resolve();
          } //all
        } //loadhendler
        that.numberOfFiles = data.length;
        if (that.numberOfFiles === 0) resolve();
        for (var i = 0, l = that.numberOfFiles; i < l; i++) {
          var dataitem = data[i];
          var extension = dataitem.url.split(".").pop();
          if (that.imageExtensions.indexOf(extension) !== -1) {
            that.loadImage(dataitem, loadHandler);
          }
          else if (that.audioExtensions.indexOf(extension) !== -1) {
            that.loadAudio(dataitem, loadHandler, SoundStore.ac);
          }
          else console.log("File type not recognized: " + dataitem.url);
        }
      });
    } //loaddata	
  this.loadAudio = function(dataitem, loadHandler, ac) {
    var that = this;
    var audio = new Sound(dataitem, loadHandler, ac);
    that.cache[dataitem.url] = audio;
  };
  this.loadImage = function(dataitem, loadHandler) {
    var that = this;
    var img = new Image();
    img.addEventListener("load", loadHandler, false);
    img.src = dataitem.url;
    if (dataitem.hasOwnProperty("attr")) {
      for (var key in dataitem.attr) {
        if (dataitem.attr.hasOwnProperty(key)) {
          img.setAttribute(key, dataitem.attr[key]);
        }
      }
    }
    that.cache[dataitem.url] = img;
  };
  this.getAsset = function(path) { return this.cache[path]; }
}

var assets = [ /* sound */
  { url: "media/wav/begin-game.wav" }, // sound for the start the game
  { url: "media/wav/welcome-shop.wav" }, // sound for welcoming to the shop
  { url: "media/wav/product-click.wav" }, // sound for adding/removing product item
  { url: "media/wav/correct-step.wav" }, // sound for proceeding to next stage 
  { url: "media/wav/incorrect-step.wav" }, // sound when no answer selected and restart game
  { url: "media/wav/exit-shop.wav" }, // sound for the end of the game
  { url: "media/wav/end-game.wav" }
]

SoundStore.loaddata(assets);

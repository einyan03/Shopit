function Sound(dataitem, loadHandler, audioContext) {
  this.source = dataitem.url;
  this.ac = audioContext;
  this.volumeNode = this.ac.createGain();
  //Values for the pan and volume getters/setters
  this.panValue = -1;
  this.volumeValue = 1;
  if (this.ac.createStereoPanner) {
    this.panNode = this.ac.createPanner();
    this.panNode.value = this.panValue;
  }
  else {
    this.panNode = this.ac.createPanner();
    this.panNode.panningModel = 'equalpower';
    this.panNode.setPosition(this.panValue, 0, 1 - Math.abs(this.panValue));
  }
  //this.panNode = this.ac.createStereoPanner();
  this.convolverNode = this.ac.createConvolver();
  this.delayNode = this.ac.createDelay();
  this.feedbackNode = this.ac.createGain();
  this.filterNode = this.ac.createBiquadFilter();
  this.soundNode = null;
  this.buffer = null;
  this.loop = false;
  this.playing = false;
  //Values to help track and set the start and pause times
  this.startTime = 0;
  this.startOffset = 0;
  //The playback rate
  this.playbackRate = 1;
  this.randomPitch = true;
  //Reverb parameters
  this.reverb = false;
  this.reverbImpulse = null;
  //Echo parameters
  this.echo = false;
  this.delayValue = 0.3;
  this.feebackValue = 0.3;
  this.filterValue = 0;
  this.load = function() {
    var that = this;
    var request = new XMLHttpRequest();
    request.open('GET', dataitem.url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      that.ac.decodeAudioData(request.response, function(decodedBuffer) {
        that.buffer = decodedBuffer;
        that.hasLoaded = true;

        loadHandler();
      });
    };
    request.onerror = function() { alert("error") };
    request.send();
  }

  this.play = function() {
    this.startTime = this.ac.currentTime;
    this.soundNode = this.ac.createBufferSource();
    this.soundNode.buffer = this.buffer;
    this.soundNode.connect(this.volumeNode);
    if (this.reverb === false) this.volumeNode.connect(this.panNode);
    else {
      this.volumeNode.connect(this.convolverNode);
      this.convolverNode.connect(this.panNode);
      this.convolverNode.buffer = this.reverbImpulse;
    }
    this.panNode.connect(this.ac.destination);
    //To create the echo effect, connect the volume to the delay, the delay to the feedback, and the feedback to the destination
    if (this.echo) {
      this.feedbackNode.gain.value = this.feebackValue;
      this.delayNode.delayTime.value = this.delayValue;
      this.filterNode.frequency.value = this.filterValue;
      this.delayNode.connect(this.feedbackNode);
      if (this.filterValue > 0) {
        this.feedbackNode.connect(this.filterNode);
        this.filterNode.connect(this.delayNode);
      }
      else {
        this.feedbackNode.connect(this.delayNode);
      }
      this.volumeNode.connect(this.delayNode);
      this.delayNode.connect(this.panNode);
    } //if (this.echo)
    //Will the sound loop? This can be `true` or `false`
    this.soundNode.loop = this.loop;
    this.soundNode.playbackRate.value = this.playbackRate;
    //Finally, use the `start` method to play the sound.The start time will either be `currentTime`, or a later time if the sound was paused
    this.soundNode.start(
      this.startTime,
      this.startOffset % this.buffer.duration
    );
    this.playing = true;
  } //play
  this.pause = function() {
    if (this.playing) {
      this.soundNode.stop(this.ac.currentTime);
      this.startOffset += this.ac.currentTime - this.startTime;
      this.playing = false;
    }
  } //pause
  this.setEcho = function(delayValue, feedbackValue, filterValue) {
    this.delayValue = delayValue || 0.3;
    this.feebackValue = feedbackValue || 0.3;
    this.filterValue = filterValue || 0;
    this.echo = true;
  } //setexho

  this.restart = function() {
    if (this.playing) this.soundNode.stop(this.ac.currentTime);
    this.startOffset = 0;
    this.startPoint = 0;
    this.endPoint = this.buffer.duration;
    this.play();
  }
  this.playFrom = function(value) {
    if (this.playing) this.soundNode.stop(this.ac.currentTime);
    this.startOffset = value;
    this.play();
  }

  this.playSection = function(start, end) {
    if (this.playing) this.soundNode.stop(this.ac.currentTime);
    if (this.startOffset === 0) this.startOffset = start;
    //Set the time to start the sound (immediately)
    this.startTime = this.ac.currentTime;
    //Create a sound node 
    this.soundNode = this.actx.createBufferSource();
    //Set the sound node's buffer property to the loaded sound
    this.soundNode.buffer = this.buffer;
    //Connect the sound to the pan, connect the pan to the
    //volume, and connect the volume to the destination
    this.soundNode.connect(this.panNode);
    this.panNode.connect(this.volumeNode);
    this.volumeNode.connect(this.actx.destination);
    //Will the sound loop? This can be `true` or `false`
    this.soundNode.loop = this.loop;
    this.soundNode.loopStart = start;
    this.soundNode.loopEnd = end;
    //Find out what the duration of the sound is
    var duration = end - start;
    //Finally, use the `start` method to play the sound.The start time will either be `currentTime`,or a later time if the sound was paused
    this.soundNode.start(this.startTime, this.startOffset % this.buffer.duration, duration);
    //Set `playing` to `true` to help control the `pause` and `restart` methods
    this.playing = true;
  } //play section

  this.getvolume = function() { return this.volumeValue; }
  this.setvolume = function(value) {
    this.volumeNode.gain.value = value;
    this.volumeValue = value;
  }
  this.getpan = function() { return this.panNode.pan.value; }
  this.setpan = function(value) { this.panNode.pan.value = value; }
  this.load();
}

function Timer(callback, options = {}) {
  this.callback = callback;

  this.lookahead = options.lookahead ?? 25;

  this.scheduleAheadTime = options.scheduleAheadTime ?? 0.1;

  this.audioContext = options.audioContext;

  this.isRunning = false;
  this.nextNoteTime = 0;
  this.timeout = null;

  this.start = () => {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    this.nextNoteTime = this.audioContext.currentTime + 0.05;

    this.scheduler();

    console.log('Timer Started');
  };

  this.stop = () => {
    this.isRunning = false;

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    console.log('Timer Stopped');
  };

  this.scheduler = () => {
    if (!this.isRunning) {
      return;
    }

    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {
      this.callback(this.nextNoteTime);

      // if BPM changes, future notes will automatically use the new tempo
      this.nextNoteTime += options.getInterval();
    }

    this.timeout = setTimeout(this.scheduler, this.lookahead);
  };
}

export default Timer;

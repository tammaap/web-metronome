function Timer(callback, options = {}) {

  // function used to schedule each note
  this.callback = callback;

  // how often JavaScript checks for notes to schedule
  this.lookahead = options.lookahead ?? 25;

  // how far ahead to schedule audio
  this.scheduleAheadTime = options.scheduleAheadTime ?? 0.1;

  // Web Audio clock
  this.audioContext = options.audioContext;

  this.isRunning = false;
  this.nextNoteTime = 0;
  this.timeout = null;


  this.start = () => {

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // start slightly in the future to schedule the first note
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

    // schedule all notes that fall within the lookahead window
    while (
      this.nextNoteTime <
      this.audioContext.currentTime + this.scheduleAheadTime
    ) {

      this.callback(this.nextNoteTime);

      // future notes use the current BPM
      this.nextNoteTime += options.getInterval();
    }

    // setTimeout only runs the scheduler, Web Audio controls the actual timing
    this.timeout = setTimeout(this.scheduler, this.lookahead);
  };
}

export default Timer;

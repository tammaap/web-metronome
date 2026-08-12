import Timer from './timer.js';

// DOM ELEMENTS

const tempoDisplay = document.querySelector('.tempo');
const tempoText = document.querySelector('.tempo-text');

const decreaseTempoBtn = document.querySelector('.decrease-tempo');
const increaseTempoBtn = document.querySelector('.increase-tempo');
const tempoSlider = document.querySelector('.slider');

const startStopBtn = document.querySelector('.start-stop');

const timeSignatureSelect = document.querySelector('.time-signature');

const beatIndicatorsContainer = document.querySelector('.beat-indicators');



// METRONOME STATE

let bpm = 120;
let timeSignature = {
  numerator: 4,
  denominator: 4
};
let count = 0;
let isRunning = false;


let tapTimes = [];
const tapTimeout = 2000;


// WEB AUDIO

const audioContext = new AudioContext();




// BEAT INDICATORS

function updateBeatIndicators() {

  beatIndicatorsContainer.innerHTML = '';

  for (let i = 0; i < timeSignature.numerator; i++) {

    const indicator = document.createElement('span');

    indicator.classList.add('beat-placeholder');

    beatIndicatorsContainer.appendChild(indicator);
  }
}


function updateBeatIndicator(beat) {

  const beatIndicators =
    beatIndicatorsContainer.querySelectorAll('.beat-placeholder');

  beatIndicators.forEach((indicator) => {
    indicator.classList.remove('active', 'downbeat');
  });

  const currentIndicator = beatIndicators[beat];

  if (!currentIndicator) {
    return;
  }

  if (beat === 0) {
    currentIndicator.classList.add('downbeat');
  } else {
    currentIndicator.classList.add('active');
  }

  setTimeout(() => {
    currentIndicator.classList.remove('active', 'downbeat');
  }, 80);
}



// CREATE METRONOME CLICK

function playClick(time) {

  updateBeatIndicator(count);

  // oscillator to generate tone.
  const oscillator = audioContext.createOscillator();

  // gain to control volume
  const gainNode = audioContext.createGain();


  if (count === 0) {

    // first beat
    oscillator.frequency.value = 1000;

  } else {

    // other beats
    oscillator.frequency.value = 800;
  }


  // Connect audio nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);


  // Create a very short click envelope

  // start silent
  gainNode.gain.setValueAtTime(0, time);

  // quickly increase volume
  gainNode.gain.linearRampToValueAtTime(1, time + 0.001);

  // quickly decrease volume
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    time + 0.05
  );


  // Schedule the oscillator
  // start and stop are scheduled using the Web Audio clock
  oscillator.start(time);
  oscillator.stop(time + 0.05);

  // move to the next beat
  count++;

  if (count >= timeSignature.numerator) {
    count = 0;
  }
}


// METRONOME TIMER

const metronome = new Timer(playClick, {

  audioContext,

  // JavaScript checks every 25ms
  lookahead: 25,

  // schedule audio 100ms into the future
  scheduleAheadTime: 0.1,

  // return the length of one beat in seconds
  getInterval: () => {
    return 60 / bpm;
  }

});


// START / STOP

async function toggleMetronome() {

  if (!isRunning) {

    await audioContext.resume();

    // start from the first beat
    count = 0;

    metronome.start();

    isRunning = true;

    startStopBtn.textContent = '■';

  } else {

    metronome.stop();

    isRunning = false;

    startStopBtn.textContent = '▶';

    // next time we start, begin at beat 1
    count = 0;
  }
}



// TAP TEMPO

function tapTempo() {
  const now = performance.now();

  // If too much time has passed, empty tapTimes
  if (
    tapTimes.length > 0 &&
    now - tapTimes[tapTimes.length - 1] > tapTimeout
  ) {
    tapTimes = [];
  }

  tapTimes.push(now);

  // At least 2 taps
  if (tapTimes.length < 2) {
    return;
  }

  // Use up to the last 4 intervals
  const recentTaps = tapTimes.slice(-5);

  let intervals = [];

  for (let i = 1; i < recentTaps.length; i++) {
    intervals.push(recentTaps[i] - recentTaps[i - 1]);
  }


  const averageInterval =
    intervals.reduce((sum, interval) => sum + interval, 0) /
    intervals.length;

  // ms -> BPM
  const newBpm = Math.round(60000 / averageInterval);

  // respect metronome limits
  bpm = Math.min(280, Math.max(20, newBpm));

  updateMetronome();
}



// TIME SIGNATURE

function updateTimeSignature(value) {

  const [numerator, denominator] = value.split('/');

  timeSignature.numerator = Number(numerator);
  timeSignature.denominator = Number(denominator);

  // Start the measure over
  count = 0;

  updateBeatIndicators();

}


timeSignatureSelect.addEventListener('change', () => {

  updateTimeSignature(timeSignatureSelect.value);

});


// TIMESIGNATURE KEYBOARD FUNCTION

function changeTimeSignatureByKeyboard(direction) {

  const options = timeSignatureSelect.options;

  let currentIndex = timeSignatureSelect.selectedIndex;

  currentIndex += direction;

  // Don't go above the first option
  if (currentIndex < 0) {
    currentIndex = 0;
  }

  // Don't go below the last option
  if (currentIndex >= options.length) {
    currentIndex = options.length - 1;
  }

  timeSignatureSelect.selectedIndex = currentIndex;

  updateTimeSignature(timeSignatureSelect.value);

}



// BUTTON
startStopBtn.addEventListener('click', toggleMetronome);


// KEYBOARD SHORTCUTS
document.addEventListener('keydown', (event) => {

  if (event.code === 'Space') {

    event.preventDefault();
    toggleMetronome();
  }

  if (event.code === 'KeyT') {
    event.preventDefault();
    tapTempo();
  }

  if (event.code === 'ArrowLeft') {

    event.preventDefault();
    const amount = event.shiftKey ? 10 : 1;
    bpm = Math.max(20, bpm - amount);
    updateMetronome();
  }


  if (event.code === 'ArrowRight') {

    event.preventDefault();
    const amount = event.shiftKey ? 10 : 1;
    bpm = Math.min(280, bpm + amount);
    updateMetronome();
  }

  if (event.code === 'ArrowUp') {

    event.preventDefault();
    changeTimeSignatureByKeyboard(-1);
  }

  if (event.code === 'ArrowDown') {

    event.preventDefault();
    changeTimeSignatureByKeyboard(1);
  }

});



// DECREASE BPM

decreaseTempoBtn.addEventListener('click', () => {

  if (bpm <= 20) {
    return;
  }

  bpm--;

  updateMetronome();
});


// INCREASE BPM

increaseTempoBtn.addEventListener('click', () => {

  if (bpm >= 280) {
    return;
  }

  bpm++;

  updateMetronome();
});


// BPM SLIDER

tempoSlider.addEventListener('input', () => {

  bpm = Number(tempoSlider.value);

  updateMetronome();
});



// UPDATE METRONOME UI

function updateMetronome() {

  tempoDisplay.textContent = bpm;

  tempoSlider.value = bpm;

  updateTempoText();
}


// UPDATE TEMPO INDICATORS

function updateTempoText() {

  let tempoTextString;

  if (bpm <= 30) { tempoTextString = "Lento" };
  if (bpm > 30 && bpm <= 60) { tempoTextString = "Largo" };
  if (bpm > 60 && bpm <= 66) { tempoTextString = "Larghetto" };
  if (bpm > 66 && bpm <= 80) { tempoTextString = "Adagio" };
  if (bpm > 80 && bpm <= 108) { tempoTextString = "Andante" };
  if (bpm > 108 && bpm <= 120) { tempoTextString = "Moderato" };
  if (bpm > 120 && bpm <= 168) { tempoTextString = "Allegro" };
  if (bpm > 168 && bpm <= 200) { tempoTextString = "Vivace" };
  if (bpm > 200 && bpm <= 252) { tempoTextString = "Presto" };
  if (bpm >= 252) { tempoTextString = "Prestissimo" };

  tempoText.textContent = tempoTextString;
}

// INITIALIZE UI

updateMetronome();
updateBeatIndicators();

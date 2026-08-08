import Timer from './timer.js';

// DOM ELEMENTS

const tempoDisplay = document.querySelector('.tempo');
const tempoText = document.querySelector('.tempo-text');

const decreaseTempoBtn = document.querySelector('.decrease-tempo');
const increaseTempoBtn = document.querySelector('.increase-tempo');
const tempoSlider = document.querySelector('.slider');

const startStopBtn = document.querySelector('.start-stop');

const subtractBeats = document.querySelector('.subtract-beats');
const addBeats = document.querySelector('.add-beats');
const measureCount = document.querySelector('.measure-count');


// METRONOME STATE

let bpm = 120;
let beatsPerMeasure = 4;
let count = 0;
let isRunning = false;


// WEB AUDIO

const audioContext = new AudioContext();


// CREATE METRONOME CLICK

function playClick(time) {

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

  if (count >= beatsPerMeasure) {
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

startStopBtn.addEventListener('click', async () => {

  if (!isRunning) {

    await audioContext.resume();

    // start from the first beat
    count = 0;

    metronome.start();

    isRunning = true;

    startStopBtn.textContent = 'STOP';

  } else {

    metronome.stop();

    isRunning = false;

    startStopBtn.textContent = 'START';

    // next time we start, begin at beat 1
    count = 0;
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


// DECREASE BEATS PER MEASURE

subtractBeats.addEventListener('click', () => {

  if (beatsPerMeasure <= 2) {
    return;
  }

  beatsPerMeasure--;

  measureCount.textContent = beatsPerMeasure;

  // start the measure over
  count = 0;
});


// INCREASE BEATS PER MEASURE

addBeats.addEventListener('click', () => {

  if (beatsPerMeasure >= 12) {
    return;
  }

  beatsPerMeasure++;

  measureCount.textContent = beatsPerMeasure;

  // start the measure over
  count = 0;
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

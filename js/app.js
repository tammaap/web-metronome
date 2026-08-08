import Timer from './timer.js';


const tempoDisplay = document.querySelector('.tempo');
const tempoText = document.querySelector('.tempo-text');

const decreaseTempoBtn = document.querySelector('.decrease-tempo');
const increaseTempoBtn = document.querySelector('.increase-tempo');
const tempoSlider = document.querySelector('.slider');

const startStopBtn = document.querySelector('.start-stop');

const subtractBeats = document.querySelector('.subtract-beats');
const addBeats = document.querySelector('.add-beats');
const measureCount = document.querySelector('.measure-count');


let bpm = 120;
let beatsPerMeasure = 4;
let count = 0;
let isRunning = false;


const audioContext = new AudioContext();


function playClick(time) {

  const oscillator = audioContext.createOscillator();

  const gainNode = audioContext.createGain();


  if (count === 0) {

    oscillator.frequency.value = 1000;

  } else {

    oscillator.frequency.value = 800;
  }


  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0, time);

  gainNode.gain.linearRampToValueAtTime(1, time + 0.001);

  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    time + 0.05
  );

  oscillator.start(time);
  oscillator.stop(time + 0.05);

  count++;

  if (count >= beatsPerMeasure) {
    count = 0;
  }
}


const metronome = new Timer(playClick, {

  audioContext,

  lookahead: 25,

  scheduleAheadTime: 0.1,

  getInterval: () => {
    return 60 / bpm;
  }

});


startStopBtn.addEventListener('click', async () => {

  if (!isRunning) {

    await audioContext.resume();

    count = 0;

    metronome.start();

    isRunning = true;

    startStopBtn.textContent = 'STOP';

  } else {

    metronome.stop();

    isRunning = false;

    startStopBtn.textContent = 'START';

    count = 0;
  }
});


decreaseTempoBtn.addEventListener('click', () => {

  if (bpm <= 20) {
    return;
  }

  bpm--;

  updateMetronome();
});


increaseTempoBtn.addEventListener('click', () => {

  if (bpm >= 280) {
    return;
  }

  bpm++;

  updateMetronome();
});


tempoSlider.addEventListener('input', () => {

  bpm = Number(tempoSlider.value);

  updateMetronome();
});


subtractBeats.addEventListener('click', () => {

  if (beatsPerMeasure <= 2) {
    return;
  }

  beatsPerMeasure--;

  measureCount.textContent = beatsPerMeasure;

  count = 0;
});


addBeats.addEventListener('click', () => {

  if (beatsPerMeasure >= 12) {
    return;
  }

  beatsPerMeasure++;

  measureCount.textContent = beatsPerMeasure;

  count = 0;
});


function updateMetronome() {

  tempoDisplay.textContent = bpm;

  tempoSlider.value = bpm;

  updateTempoText();
}


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

updateMetronome();

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
let tempoTextString = 'Allegro';

decreaseTempoBtn.addEventListener('click', () => {
  if (bpm <= 20) { return }
  bpm--;
  validateTempo()
  updateMetronome()
});

increaseTempoBtn.addEventListener('click', () => {
  if (bpm >= 280) { return }
  bpm++;
  validateTempo()
  updateMetronome()
});


tempoSlider.addEventListener('input', () => {
  bpm = tempoSlider.value;
  validateTempo()
  updateMetronome()
});

subtractBeats.addEventListener('click', () => {
  if (beatsPerMeasure <= 2) { return };
  beatsPerMeasure--;
  measureCount.textContent = beatsPerMeasure;
});

addBeats.addEventListener('click', () => {
  if (beatsPerMeasure >= 12) { return };
  beatsPerMeasure++;
  measureCount.textContent = beatsPerMeasure;
});

function updateMetronome() {
  tempoDisplay.textContent = bpm;
  tempoSlider.value = bpm;

  // Add tempo indicators
  if (bpm <= 30) { tempoTextString = "Lento" };
  if (bpm > 30 && bpm < 60) { tempoTextString = "Largo" };
  if (bpm > 60 && bpm < 66) { tempoTextString = "Larghetto" };
  if (bpm > 66 && bpm < 80) { tempoTextString = "Adagio" };
  if (bpm > 80 && bpm < 108) { tempoTextString = "Andante" };
  if (bpm > 108 && bpm < 120) { tempoTextString = "Moderato" };
  if (bpm > 120 && bpm < 168) { tempoTextString = "Allegro" };
  if (bpm > 168 && bpm < 200) { tempoTextString = "Vivace" };
  if (bpm > 200 && bpm < 252) { tempoTextString = "Presto" };
  if (bpm >= 252) { tempoTextString = "Prestissimo" };

  tempoText.textContent = tempoTextString;
}

function validateTempo() {
  if (bpm <= 20) { return };
  if (bpm >= 280) { return };
}

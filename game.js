import { words as ALL_WORDS } from './data.js';

const INITIAL_TIME = 30;

const $game = document.querySelector('#game');
const $time = document.querySelector('time');
const $paragraph = document.querySelector('p');
const $input = document.querySelector('input');

// Results elements
const $results = document.querySelector('#results');
const $wpm = document.querySelector('#wpm');
const $accuracy = document.querySelector('#accuracy');
const $restart = document.querySelector('.restart');

let words = [];
let currentTime = INITIAL_TIME;

initGame();
initEvents();

function initGame() {
  words = ALL_WORDS.toSorted(() => Math.random() - 0.5).slice(0, 32);
  currentTime = INITIAL_TIME;

  $time.textContent = currentTime;

  $paragraph.innerHTML = words
    .map((word, index) => {
      const letters = word.split('');

      return `<x-word>
      ${letters
        .map((letter) => {
          return `<x-letter>${letter}</x-letter>`;
        })
        .join('')}
    </x-word>`;
    })
    .join('');

  const firstWord = $paragraph.querySelector('x-word');
  firstWord.classList.add('active');

  firstWord.querySelector('x-letter').classList.add('active');

  const intervalId = setInterval(() => {
    currentTime--;

    $time.textContent = currentTime;

    if (currentTime === 0) {
      clearInterval(intervalId);
      gameOver();
    }
  }, 1000);
}

function initEvents() {
  document.addEventListener('keydown', () => {
    $input.focus();
  });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  $restart.addEventListener('click', restartGame);
}

function onKeyDown(event) {
  const { key } = event;
  const $currentWord = $paragraph.querySelector('.active');

  const $currentLetter = $currentWord.querySelector('.active');

  if (key === ' ') {
    event.preventDefault();

    $currentWord.classList.remove('active', 'marked');
    $currentLetter.classList.remove('active');

    const $nextWord = $currentWord.nextElementSibling;
    const $nextLetter = $nextWord.querySelector('x-letter');

    $nextWord.classList.add('active');
    $nextLetter.classList.add('active');
    $input.value = '';

    const hasMissedLetters =
      $currentWord.querySelectorAll('x-letter:not(.correct)').length > 0;

    const classToAdd = hasMissedLetters ? 'marked' : 'correct';
    $currentWord.classList.add(classToAdd);
  }

  if (key === 'Backspace') {
    const $prevWord = $currentWord.previousElementSibling;
    const $prevLetter = $currentLetter.previousElementSibling;

    if (!$prevWord && !$prevLetter) {
      event.preventDefault();
    }

    const $prevWordMarked = $prevWord.classList.contains('marked');
    if (!$prevLetter && $prevWordMarked) {
      event.preventDefault();

      if ($prevWordMarked) {
        $prevWord.classList.remove('marked');
        $prevWord.classList.add('active');

        const $firstNotCorrectLetter = $prevWord.querySelector(
          'x-letter:last-child'
        );
        $currentLetter.classList.remove('active');

        $firstNotCorrectLetter.classList.add('active');

        $input.value = [...$prevWord.querySelectorAll('x-letter.correct')]
          .map(($element) => $element.innerText)
          .join('');
      }
    }
  }
}

function onKeyUp(event) {
  const $currentWord = $paragraph.querySelector('.active');
  const $currentLetter = $currentWord.querySelector('.active');

  const currentWord = $currentWord.innerText.trim(' ');
  $input.maxLength = currentWord.length;

  const $allLetters = $currentWord.querySelectorAll('x-letter');
  $allLetters.forEach(($letter) =>
    $letter.classList.remove('correct', 'incorrect')
  );

  $input.value.split('').forEach((letter, index) => {
    const $letterInput = $allLetters[index];
    const $letterToCheck = currentWord[index];

    const isCorrect = letter === $letterToCheck;

    const letterClass = isCorrect ? 'correct' : 'incorrect';
    $letterInput.classList.add(letterClass);

    $currentLetter.classList.remove('active', 'is-last');
    const inputLength = $input.value.length;
    const nextActiveLetter = $allLetters[inputLength];

    if (nextActiveLetter) {
      nextActiveLetter.classList.add('active');
    } else {
      $currentLetter.classList.add('active', 'is-last');
    }
  });
}

function gameOver() {
  $game.style.display = 'none';
  $results.style.display = 'flex';
  $results.style.opacity = 1;

  const correctWords = $paragraph.querySelectorAll('x-word.correct').length;
  const correctLetters = $paragraph.querySelectorAll('x-letter.correct').length;
  const incorrectLetters =
    $paragraph.querySelectorAll('x-letter.incorrect').length;

  const totalLetters = correctLetters + incorrectLetters;

  const accuracy = totalLetters > 0 ? (correctLetters / totalLetters) * 100 : 0;
  const wpm = (correctWords * 60) / INITIAL_TIME;

  $accuracy.textContent = `${accuracy.toFixed(2)}%`;
  $wpm.textContent = wpm;
}

function restartGame() {
  $game.style.display = 'flex';
  $results.style.display = 'none';

  initGame();
}

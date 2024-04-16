let currentWord;
let guessedLetters = [];
let mistakes = 0;
const maxMistakes = 6; // Adjust based on your hangman design

function displayWord(word) {
    currentWord = word;
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerHTML = word.split('').map(letter => `<span class="blank">${guessedLetters.includes(letter) ? letter : '_'}</span>`).join(' ');
}


async function fetchRandomWord() {
    try {
        const apiUrl = 'https://random-word-api.herokuapp.com/word?number=1';
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        return words[0]; // The API returns an array, so we take the first element
    } catch (error) {
        console.error("Error fetching word:", error);
        return null; // Return null or a default word in case of an error
    }
}

function startGame() {
    fetchRandomWord().then(word => {
        // Initialize game with this word
    });
}

function setupLetterButtons() {
    const letterButtons = document.getElementById('letter-buttons');
    for (let charCode = 65; charCode <= 90; charCode++) { // ASCII codes for A-Z
        const button = document.createElement('button');
        button.textContent = String.fromCharCode(charCode);
        button.addEventListener('click', () => handleGuess(button.textContent));
        letterButtons.appendChild(button);
    }
}

function handleGuess(chosenLetter) {
    guessedLetters.push(chosenLetter);
    // Disable the chosen letter button
    document.querySelector(`button:contains('${chosenLetter}')`).disabled = true;

    if (currentWord.includes(chosenLetter)) {
        // Correct guess
        displayWord(currentWord);
        checkWinCondition();
    } else {
        // Incorrect guess
        mistakes++;
        updateHangmanDisplay(mistakes);
        checkLoseCondition();
    }
}

function updateHangmanDisplay(mistakes) {
    const hangmanDisplay = document.getElementById('hangman-display');
    // Update the display based on the number of mistakes
    // This could be as simple as showing parts of the hangman or updating an image
}

function checkWinCondition() {
    const allLettersGuessed = currentWord.split('').every(letter => guessedLetters.includes(letter));
    if (allLettersGuessed) {
        alert('Congratulations! You won!');
        // Additional win logic here
    }
}

function checkLoseCondition() {
    if (mistakes >= maxMistakes) {
        alert('Game over! The word was ' + currentWord);
        // Additional lose logic here
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    setupLetterButtons();
    const randomWord = await fetchRandomWord();
    if (randomWord) {
        displayWord(randomWord);
    } else {
        // Handle error, maybe use a default word or show a message
    }
});

document.addEventListener('DOMContentLoaded', startGame);

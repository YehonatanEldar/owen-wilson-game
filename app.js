let currentWow = null;
let audioElement = null;

async function fetchRandomWow() {
    try {
        const response = await fetch('https://owen-wilson-wow-api.onrender.com/wows/random');
        const data = await response.json();
        currentWow = data[0]; // API returns an array
        console.log('Loaded wow from:', currentWow.movie, currentWow.year);
    } catch (error) {
        console.error('Error fetching wow:', error);
        currentWow = {
            movie: "Wedding Crashers",
            year: 2005,
            audio: null,
            video: { "720p": null }
        };
    }
}

async function newGame() {
    await fetchRandomWow();
    document.getElementById('revealSection').classList.remove('show');
    document.getElementById('movieGuess').value = '';
    document.getElementById('resultMessage').className = 'result-message';
    document.getElementById('resultMessage').textContent = '';
    document.getElementById('guessReveal').style.display = 'none';
    document.getElementById('playAgainBtn').style.display = 'none';  // hide the button
    document.getElementById('randomFactContainer').textContent = ''; // clear fact too

    // Show the guess section again
    document.querySelector('.guess-section').style.display = 'block';
    document.querySelector('.check-btn').style.display = 'block';

    const randomFactBtn = document.getElementById('randomFactBtn');
    randomFactBtn.disabled = false;
}




function playWowSound() {
    console.log('Playing sound for:', currentWow ? currentWow.movie : 'No current wow');
    if (!currentWow || !currentWow.audio) return;

    const playBtn = document.getElementById('playBtn');
 
    if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
    }

    audioElement = new Audio(currentWow.audio);
    playBtn.classList.add('playing');
    playBtn.textContent = '♪ Playing... ♪';

    audioElement.play().catch(() => playBtn.textContent = 'Audio Error');

    audioElement.onended = () => {
        playBtn.classList.remove('playing');
        playBtn.textContent = '▶︎';
    };
}

function showRandomFact() {
    if (!currentWow) return;

    const factContainer = document.getElementById('randomFactContainer');
    const randomFactBtn = document.getElementById('randomFactBtn');

    // Prevent multiple uses
    if (randomFactBtn.disabled) return;

    // Extract year from release_date if possible
    const releaseYear = currentWow.release_date ? currentWow.release_date.slice(0,4) : currentWow.year;

    // Possible facts to show
    const facts = [
        { label: "Line", value: currentWow.full_line },
        { label: "Director", value: currentWow.director },
        { label: "Year", value: releaseYear },
        { label: "Character", value: currentWow.character }
    ];

    // Filter out empty/null values
    const availableFacts = facts.filter(f => f.value && f.value.trim() !== "");
    if (availableFacts.length === 0) return;

    const randomFact = availableFacts[Math.floor(Math.random() * availableFacts.length)];

    factContainer.textContent = `${randomFact.label}: ${randomFact.value}`;

    // Disable button and style it gray
    randomFactBtn.disabled = true;
    randomFactBtn.style.background = '#7f8c8d';  // gray color
    randomFactBtn.style.cursor = 'not-allowed';
}



function checkAnswer() {
    const guessInput = document.getElementById('movieGuess');
    const resultMessage = document.getElementById('resultMessage');
    const guessReveal = document.getElementById('guessReveal');
    const posterImg = document.getElementById('posterImg');
    const movieInfo = document.getElementById('movieInfo');
    const playAgainBtn = document.getElementById('playAgainBtn');

    const userGuess = guessInput.value.trim().toLowerCase();
    const correctAnswer = currentWow.movie.toLowerCase();

    if (!userGuess) {
        resultMessage.textContent = 'Please enter a guess first!';
        resultMessage.className = 'result-message incorrect';
        guessReveal.style.display = 'none';  // hide reveal
        playAgainBtn.style.display = 'none'; // hide play again button
        return;
    }

    if (userGuess === correctAnswer) {
        resultMessage.textContent = `Wow! You're amazing! It's ${currentWow.movie}! (but you already knew that)`;
        resultMessage.className = 'result-message correct';
    } else {
        resultMessage.textContent = `Wow! You're stupid. The answer is ${currentWow.movie}!`;
        resultMessage.className = 'result-message incorrect';
    }

    // Show poster and movie info after guess
    posterImg.src = currentWow.poster || '';
    posterImg.alt = `Poster of ${currentWow.movie}`;
    movieInfo.textContent = `${currentWow.movie} (${currentWow.year})`;

    guessReveal.style.display = 'block';

    // Show the Play Again button now
    playAgainBtn.style.display = 'inline-block';

    // Hide the guess section
    document.querySelector('.guess-section').style.display = 'none';
    document.getElementById('checkBtn').style.display = 'none';
}



function revealVideo() {
    const revealSection = document.getElementById('revealSection');
    const videoContainer = document.getElementById('videoContainer');

    revealSection.classList.add('show');

    if (currentWow && currentWow.video && currentWow.video["720p"]) {
        videoContainer.innerHTML = `
            <video controls width="100%">
                <source src="${currentWow.video["720p"]}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    } else {
        videoContainer.innerHTML = `<p style="color: red;">No video available.</p>`;
    }
}



document.getElementById('movieGuess').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAnswer();
});

window.onload = newGame;
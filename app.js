// Quiz Data Definition
const quizData = [
    {
        number: "QUESTION 01",
        hints: [
            "불을 끄고 어머니는 떡을 썰고 자신은 글씨를 쓴 일화가 있음.",
            "조선 시대를 대표하는 최고의 명필로 꼽힘."
        ],
        answers: ["한석봉", "한호"]
    },
    {
        number: "QUESTION 02",
        hints: [
            "강릉에서 태어난 한국의 남성.",
            "훌륭한 어머니의 가르침을 받으며 자란 인물.",
            "국가의 정신적 기반을 다진 인물로 꼽힘."
        ],
        answers: ["율곡이이", "이이", "율곡"]
    },
    {
        number: "QUESTION 03 (FINAL)",
        hints: [
            "훌륭한 교사 부부의 가르침을 받는 인물.",
            "최근 가장 뜨거운 기대를 받는 인물로 꼽힘.",
            "강릉에서 태어나 첫발을 내딛는 한국의 남성."
        ],
        answers: [] // 3번은 어떤 답을 적어도 무조건 감동의 젠더 리빌 페이지로 전환!
    }
];

// App State Variables
let currentQuestionIndex = 0;
let soundEnabled = true;
let audioCtx = null;
let consecutiveWrongAnswers = 0;

// DOM Elements
const screenWelcome = document.getElementById("screen-welcome");
const screenQuiz = document.getElementById("screen-quiz");
const screenReveal = document.getElementById("screen-reveal");

const btnStart = document.getElementById("btn-start");
const btnSoundToggle = document.getElementById("btn-sound-toggle");
const btnSubmit = document.getElementById("btn-submit");
const btnClear = document.getElementById("btn-clear");
const btnNextQuestion = document.getElementById("btn-next-question");
const btnGoGift = document.getElementById("btn-go-gift");
const btnPopAgain = document.getElementById("btn-pop-again");
const btnShare = document.getElementById("btn-share");

const quizInput = document.getElementById("quiz-input");
const errorMessage = document.getElementById("error-message");
const quizProgressFill = document.getElementById("quiz-progress-fill");
const progressPencil = document.getElementById("progress-pencil");
const quizStepText = document.getElementById("quiz-step-text");
const questionNumber = document.getElementById("question-number");
const hintsContainer = document.getElementById("hints-container");
const feedbackOverlay = document.getElementById("feedback-overlay");
const feedbackText = document.getElementById("feedback-text");
const quizCard = document.getElementById("quiz-card");

const revealIntro = document.getElementById("reveal-intro");
const revealGift = document.getElementById("reveal-gift");
const revealResult = document.getElementById("reveal-result");
const giftBoxTrigger = document.getElementById("gift-box-trigger");

// Web Audio API Synthesizer
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playCorrectSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    // Cute 3-note "Ding Dong Deng" arpeggio (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99];
    const duration = 0.15;
    const gap = 0.12;
    
    notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * gap);
        
        gainNode.gain.setValueAtTime(0, now + index * gap);
        gainNode.gain.linearRampToValueAtTime(0.25, now + index * gap + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + index * gap + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(now + index * gap);
        osc.stop(now + index * gap + duration);
    });
}

function playIncorrectSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    
    // Low frequency buzz slide
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.35);
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, now);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
}

function playPopSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Bubble pop sound (sine sweep down)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.08);
}

function playFanfareSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    // Happy major arpeggio: C4 (261.63), E4 (329.63), G4 (392.00), C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const delays = [0, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36];
    
    freqs.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle'; // Soft flute/bell-like wave
        osc.frequency.setValueAtTime(freq, now + delays[index]);
        
        gainNode.gain.setValueAtTime(0, now + delays[index]);
        gainNode.gain.linearRampToValueAtTime(0.18, now + delays[index] + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delays[index] + 0.8);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(now + delays[index]);
        osc.stop(now + delays[index] + 0.8);
    });
}

// Sparkle/Chime sound for hint triggers
function playChimeSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
}

// Confetti Explosion
function triggerConfetti() {
    // Left side launcher
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.1, y: 0.6 },
        colors: ['#90E0EF', '#0096C7', '#0077B6', '#FFDE85', '#FFF']
    });
    
    // Right side launcher
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.9, y: 0.6 },
        colors: ['#90E0EF', '#0096C7', '#0077B6', '#FFDE85', '#FFF']
    });
    
    // Direct burst in center
    setTimeout(() => {
        confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#90E0EF', '#00B4D8', '#48CAE4', '#FF8E9E', '#FFF275']
        });
    }, 250);
}

// App Navigation & Rendering
function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove("active");
    setTimeout(() => {
        toScreen.classList.add("active");
    }, 150);
}

function loadQuestion(index) {
    const data = quizData[index];
    
    // Update Header
    questionNumber.innerText = data.number;
    quizStepText.innerText = `Q${index + 1} / 3`;
    
    // Calculate progress (Q1 is 33.3%, Q2 is 66.6%, Q3 is 100%)
    const percentage = ((index + 1) / 3) * 100;
    quizProgressFill.style.width = `${percentage}%`;
    progressPencil.style.left = `calc(${percentage}% - 8px)`;
    
    // Clear Input and Errors
    quizInput.value = "";
    quizInput.placeholder = index === 2 ? "자유롭게 입력해 주세요" : "정답을 입력해 주세요";
    errorMessage.innerText = "";
    btnClear.style.display = "none";
    
    // Render Hints with Staggered Delays
    hintsContainer.innerHTML = "";
    data.hints.forEach((hintText, hintIndex) => {
        const hintDiv = document.createElement("div");
        hintDiv.className = "hint-item";
        hintDiv.style.animationDelay = `${hintIndex * 0.35}s`;
        
        // Bullet icons: Q1, Q2 are study icons, Q3 final question hints are hearts/stars
        const bulletIcon = index === 2 ? "✨" : "💡";
        
        hintDiv.innerHTML = `
            <span class="hint-icon">${bulletIcon}</span>
            <span class="hint-content">${hintText}</span>
        `;
        hintsContainer.appendChild(hintDiv);
    });

    // Reset wrong answer count
    consecutiveWrongAnswers = 0;
    
    // Auto-focus input
    setTimeout(() => {
        quizInput.focus();
    }, 400);
}

// Event Listeners Initialization
function initEvents() {
    // Start Game
    btnStart.addEventListener("click", () => {
        initAudio();
        playCorrectSound();
        switchScreen(screenWelcome, screenQuiz);
        loadQuestion(0);
    });

    // Sound Toggle Button
    btnSoundToggle.addEventListener("click", () => {
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            btnSoundToggle.innerText = "🔊";
            initAudio();
            playChimeSound();
        } else {
            btnSoundToggle.innerText = "🔇";
        }
    });

    // Handle Input clear button visibility
    quizInput.addEventListener("input", () => {
        if (quizInput.value.length > 0) {
            btnClear.style.display = "block";
        } else {
            btnClear.style.display = "none";
        }
    });

    btnClear.addEventListener("click", () => {
        quizInput.value = "";
        btnClear.style.display = "none";
        quizInput.focus();
    });

    // Answer Submission
    btnSubmit.addEventListener("click", checkAnswer);
    quizInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            checkAnswer();
        }
    });

    // Next Question Button
    btnNextQuestion.addEventListener("click", () => {
        feedbackOverlay.classList.remove("active");
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion(currentQuestionIndex);
        } else {
            // End of Quiz - Go to Reveal Intro
            switchScreen(screenQuiz, screenReveal);
            revealIntro.classList.add("active");
        }
    });

    // Go to Gift screen from Intro
    btnGoGift.addEventListener("click", () => {
        playPopSound();
        revealIntro.classList.remove("active");
        revealGift.classList.add("active");
    });

    // Gift Box Open Click Trigger
    giftBoxTrigger.addEventListener("click", () => {
        // Shake/Animate Box opening
        const svgBox = giftBoxTrigger.querySelector(".gift-box");
        svgBox.style.animation = "none"; // Clear pulse animation
        
        // Add Popping Animation Class
        giftBoxTrigger.classList.add("popped");
        
        // Play special effects
        playPopSound();
        
        // Short delay for visual popping build up
        setTimeout(() => {
            playFanfareSound();
            triggerConfetti();
            
            // Switch views inside Reveal screen
            revealGift.classList.remove("active");
            revealResult.classList.add("active");
            
            // Auto-play the video (15-week by default)
            const babyVideo = document.getElementById("baby-video");
            if (babyVideo) {
                setTimeout(() => {
                    babyVideo.play().catch(err => {
                        console.log("Video auto-play blocked: ", err);
                    });
                }, 600);
            }
            
            // Trigger haptic feedback if supported
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 200]);
            }
        }, 500);
    });

    // Pop Confetti Again
    btnPopAgain.addEventListener("click", () => {
        playPopSound();
        triggerConfetti();
    });

    // Share link functionality
    btnShare.addEventListener("click", () => {
        const textToCopy = window.location.href;
        navigator.clipboard.writeText(textToCopy).then(() => {
            playChimeSound();
            const originalText = btnShare.innerText;
            btnShare.innerText = "링크 복사 완료! 🔗";
            btnShare.style.backgroundColor = "#E6FFFA";
            btnShare.style.borderColor = "#319795";
            
            setTimeout(() => {
                btnShare.innerText = originalText;
                btnShare.style.backgroundColor = "";
                btnShare.style.borderColor = "";
            }, 2000);
        }).catch(err => {
            console.error("Could not copy link: ", err);
        });
    });

    // Video tabs switching logic
    const tabBtns = document.querySelectorAll(".tab-btn");
    const babyVideo = document.getElementById("baby-video");

    if (tabBtns.length > 0 && babyVideo) {
        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // Remove active class from all buttons
                tabBtns.forEach(b => b.classList.remove("active"));
                
                // Add active class to clicked button
                btn.classList.add("active");
                
                // Change video source and play
                const videoSrc = btn.getAttribute("data-video");
                
                // Pause current video
                babyVideo.pause();
                
                // Update source
                babyVideo.src = videoSrc;
                babyVideo.load();
                
                // Play
                babyVideo.play().catch(err => {
                    console.log("Video playback prevented: ", err);
                });
                
                playPopSound(); // Play cute feedback click sound
            });
        });
    }
}

// Answer Validator
function checkAnswer() {
    const rawInput = quizInput.value;
    const userAnswer = rawInput.trim().replace(/\s+/g, ""); // Remove spaces
    const data = quizData[currentQuestionIndex];
    
    // Q3 is the special Gender Reveal trigger - accept anything
    if (currentQuestionIndex === 2) {
        playCorrectSound();
        
        // Custom popup congratulatory feedback
        feedbackText.innerText = "오늘의 핵심 위인을 모두 공부했습니다! 참교사 스케줄러에 스탬프가 찍힙니다. 🎖️";
        feedbackOverlay.classList.add("active");
        return;
    }
    
    // Regular validation for Q1 and Q2
    if (!userAnswer) {
        errorMessage.innerText = "정답을 적어 주세요!";
        shakeCard();
        playIncorrectSound();
        return;
    }
    
    const isCorrect = data.answers.some(ans => {
        const normalizedAns = ans.trim().replace(/\s+/g, "");
        return userAnswer === normalizedAns || userAnswer.includes(normalizedAns);
    });
    
    if (isCorrect) {
        playCorrectSound();
        errorMessage.innerText = "";
        
        // Show correct modal
        if (currentQuestionIndex === 0) {
            feedbackText.innerText = "명필 한석봉(한호)에 대해 완벽하게 마스터하셨습니다! ✏️";
        } else if (currentQuestionIndex === 1) {
            feedbackText.innerText = "강릉이 낳은 위대한 현인 율곡 이이에 대해 완벽하게 공부하셨습니다! 🌾";
        }
        feedbackOverlay.classList.add("active");
    } else {
        playIncorrectSound();
        consecutiveWrongAnswers++;
        shakeCard();
        
        if (consecutiveWrongAnswers >= 3) {
            errorMessage.innerText = `힌트가 부족한가요? 정답은 [${data.answers[0]}] 이에요! 한번 적어보세요. 😉`;
        } else {
            errorMessage.innerText = "앗, 오답이에요! 힌트를 꼼꼼히 다시 읽어보세요. 🥺";
        }
    }
}

function shakeCard() {
    quizCard.classList.add("shake");
    setTimeout(() => {
        quizCard.classList.remove("shake");
    }, 450);
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
    initEvents();
    
    // If we want audio consent button to display initially
    // Check if autoplay is blocked or setup lazy loading
    // In this app, we initialize audio context directly on user clicks (Start button, check answer, etc.)
});

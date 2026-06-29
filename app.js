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
            "세상에서 가장 다정한 엄마 아빠의 사랑을 듬뿍 받는 인물.",
            "최근 가장 뜨거운 기대를 받는 인물로 꼽힘.",
            "엄마 아빠의 사랑을 가득 받고 태어날 소중한 남자 아기.",
        ],
        answers: [] // 3번은 플래시카드 뒤집으면 감동의 젠더 리빌로 이어집니다!
    }
];

// App State Variables
let currentQuestionIndex = 0;
let hintsRevealedCount = 1;
let soundEnabled = true;
let audioCtx = null;

// DOM Elements
const screenWelcome = document.getElementById("screen-welcome");
const screenQuiz = document.getElementById("screen-quiz");
const screenReveal = document.getElementById("screen-reveal");

const btnStart = document.getElementById("btn-start");
const btnSoundToggle = document.getElementById("btn-sound-toggle");
const btnNextHint = document.getElementById("btn-next-hint");
const btnFlipCard = document.getElementById("btn-flip-card");
const btnNextQuestion = document.getElementById("btn-next-question");

const btnGoGift = document.getElementById("btn-go-gift");
const btnPopAgain = document.getElementById("btn-pop-again");
const btnShare = document.getElementById("btn-share");

const quizProgressFill = document.getElementById("quiz-progress-fill");
const progressPencil = document.getElementById("progress-pencil");
const quizStepText = document.getElementById("quiz-step-text");
const questionNumber = document.getElementById("question-number");
const hintsContainer = document.getElementById("hints-container");
const hintCountText = document.getElementById("hint-count-text");
const quizCard = document.getElementById("quiz-card");

const answerTitle = document.getElementById("card-answer-title");
const answerImg = document.getElementById("answer-img");
const answerDesc = document.getElementById("answer-description");

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

function playChimeSound() {
    if (!soundEnabled) return;
    initAudio();
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.12);
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
    
    // Reset hint state
    hintsRevealedCount = 1;
    
    // Render Hints
    hintsContainer.innerHTML = "";
    data.hints.forEach((hintText, hintIndex) => {
        const hintDiv = document.createElement("div");
        // Only first hint is visible, rest are hidden initially
        hintDiv.className = `hint-item ${hintIndex >= hintsRevealedCount ? 'hidden' : ''}`;
        
        // Bullet icons: Q3 has stars, Q1 & Q2 have study lightbulbs
        const bulletIcon = index === 2 ? "✨" : "💡";
        
        hintDiv.innerHTML = `
            <span class="hint-icon">${bulletIcon}</span>
            <span class="hint-content">${hintText}</span>
        `;
        hintsContainer.appendChild(hintDiv);
    });

    updateHintControls();
}

function updateHintControls() {
    const data = quizData[currentQuestionIndex];
    const total = data.hints.length;
    
    // Update footer status text
    hintCountText.innerText = `공개된 힌트: ${hintsRevealedCount} / ${total}`;
    
    // Show/Hide Next Hint Button
    if (hintsRevealedCount >= total) {
        btnNextHint.style.display = "none";
    } else {
        btnNextHint.style.display = "block";
    }
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

    // Next Hint Action
    btnNextHint.addEventListener("click", () => {
        const data = quizData[currentQuestionIndex];
        if (hintsRevealedCount < data.hints.length) {
            hintsRevealedCount++;
            playChimeSound();
            
            // Remove hidden class from the newly revealed hint
            const hintItems = hintsContainer.querySelectorAll(".hint-item");
            if (hintItems[hintsRevealedCount - 1]) {
                hintItems[hintsRevealedCount - 1].classList.remove("hidden");
            }
            
            updateHintControls();
        }
    });

    // Flip Card / Show Answer Action
    btnFlipCard.addEventListener("click", () => {
        playCorrectSound();
        
        const data = quizData[currentQuestionIndex];
        
        // Setup Card Back Content dynamically
        if (currentQuestionIndex === 0) {
            answerTitle.innerText = "정답은 한석봉 (한호) ✏️";
            answerImg.src = "han_seok_bong.png";
            answerDesc.innerText = "어머니가 불을 끄고 떡을 써는 동안 명필 글씨를 쓴 실화로 유명한 조선 최고의 서예가입니다.";
        } else if (currentQuestionIndex === 1) {
            answerTitle.innerText = "정답은 율곡 이이 🌾";
            answerImg.src = "yulgok_yi_i.png";
            answerDesc.innerText = "신사임당의 가르침을 받아 자라나 국가의 정신적 기틀을 마련한 조선의 대표적인 학자입니다.";
        } else if (currentQuestionIndex === 2) {
            answerTitle.innerText = "정답은 우리 아기 '복복이'! 👶🏻💙";
            answerImg.src = "baby_boy_bokbok.png";
            answerDesc.innerText = "엄마 아빠의 사랑을 가득 받고 태어날 세상에서 가장 소중하고 귀여운 남자 아기입니다! 👶🏻💙";
        }
        
        // Trigger 3D CSS Rotate Y animation
        quizCard.classList.add("flipped");
        
        // Adjust control buttons
        btnNextHint.style.display = "none";
        btnFlipCard.style.display = "none";
        btnNextQuestion.style.display = "block";
        
        if (currentQuestionIndex === 2) {
            btnNextQuestion.innerText = "특별 알림장 확인하기 💌";
        } else {
            btnNextQuestion.innerText = "다음 문제 풀기 ➡️";
        }
    });

    // Next Question Action
    btnNextQuestion.addEventListener("click", () => {
        initAudio();
        
        if (currentQuestionIndex < quizData.length - 1) {
            // 1. Flip card back first
            quizCard.classList.remove("flipped");
            playPopSound();
            
            // 2. Wait for flip animation (600ms) then load new question
            setTimeout(() => {
                currentQuestionIndex++;
                loadQuestion(currentQuestionIndex);
                
                // Reset buttons
                btnFlipCard.style.display = "block";
                btnNextQuestion.style.display = "none";
            }, 600);
        } else {
            // End of Quiz: Go to Gender Reveal screen
            playCorrectSound();
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
        const svgBox = giftBoxTrigger.querySelector(".gift-box");
        svgBox.style.animation = "none"; // Stop floating pulse
        
        giftBoxTrigger.classList.add("popped");
        playPopSound();
        
        setTimeout(() => {
            playFanfareSound();
            triggerConfetti();
            
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
                tabBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                const videoSrc = btn.getAttribute("data-video");
                
                babyVideo.pause();
                babyVideo.src = videoSrc;
                babyVideo.load();
                
                babyVideo.play().catch(err => {
                    console.log("Video playback prevented: ", err);
                });
                
                playPopSound();
            });
        });
    }

    // Fullscreen button event listener
    const btnFullscreen = document.getElementById("btn-fullscreen");
    if (btnFullscreen && babyVideo) {
        btnFullscreen.addEventListener("click", () => {
            initAudio();
            playPopSound();
            if (babyVideo.requestFullscreen) {
                babyVideo.requestFullscreen();
            } else if (babyVideo.webkitRequestFullscreen) { /* Safari */
                babyVideo.webkitRequestFullscreen();
            } else if (babyVideo.msRequestFullscreen) { /* IE11 */
                babyVideo.msRequestFullscreen();
            } else if (babyVideo.webkitEnterFullscreen) { /* iOS Safari fallback */
                babyVideo.webkitEnterFullscreen();
            }
        });
    }
}

// Initialize on DOM load
window.addEventListener("DOMContentLoaded", () => {
    initEvents();
});

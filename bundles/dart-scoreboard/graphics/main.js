'use strict';

// Replicants
const matchInfo = nodecg.Replicant('matchInfo');
const player1State = nodecg.Replicant('player1State');
const player2State = nodecg.Replicant('player2State');
const currentTurn = nodecg.Replicant('currentTurn');
const overlayScale = nodecg.Replicant('overlayScale', { defaultValue: 1.0 });

// DOM
const p1Name = document.getElementById('p1Name');
const p1Score = document.getElementById('p1Score');
const p1Sets = document.getElementById('p1Sets');
const p1Legs = document.getElementById('p1Legs');
const p1Checkout = document.getElementById('p1Checkout');
const p1Box = document.getElementById('p1Box');

const p2Name = document.getElementById('p2Name');
const p2Score = document.getElementById('p2Score');
const p2Sets = document.getElementById('p2Sets');
const p2Legs = document.getElementById('p2Legs');
const p2Checkout = document.getElementById('p2Checkout');
const p2Box = document.getElementById('p2Box');

const setTargetDisplay = document.getElementById('setTargetDisplay');
const legTargetDisplay = document.getElementById('legTargetDisplay');
const oneEightyAnim = document.getElementById('oneEightyAnim');

// Bitiş (Checkout) Rotası Hesaplayıcı
let checkoutRoutes = {};
fetch('checkout.json')
    .then(res => res.json())
    .then(data => {
        for (let score in data) {
            checkoutRoutes[score] = data[score].join(' ');
        }
    })
    .catch(err => console.error('Checkout verisi yüklenemedi:', err));

// NodeCG Replicant dinleyicileri
NodeCG.waitForReplicants(matchInfo, player1State, player2State, currentTurn, overlayScale).then(() => {
    matchInfo.on('change', (newVal) => {
        if (!newVal) return;
        p1Name.innerText = newVal.player1Name;
        p2Name.innerText = newVal.player2Name;
        setTargetDisplay.innerText = newVal.setTarget;
        legTargetDisplay.innerText = newVal.legTarget;
    });

    player1State.on('change', (newVal, oldVal) => {
        if (!newVal) return;
        updatePlayerUI(1, newVal, oldVal);
    });

    player2State.on('change', (newVal, oldVal) => {
        if (!newVal) return;
        updatePlayerUI(2, newVal, oldVal);
    });

    currentTurn.on('change', (newVal) => {
        if (newVal === 'p1') {
            p1Box.classList.add('active');
            p2Box.classList.remove('active');
        } else {
            p2Box.classList.add('active');
            p1Box.classList.remove('active');
        }
    });

    overlayScale.on('change', (newVal) => {
        if (newVal !== undefined) {
            document.querySelector('.scoreboard').style.transform = `scale(${newVal})`;
        }
    });
});

function updatePlayerUI(playerNum, newVal, oldVal) {
    const scoreElem = playerNum === 1 ? p1Score : p2Score;
    const setsElem = playerNum === 1 ? p1Sets : p2Sets;
    const legsElem = playerNum === 1 ? p1Legs : p2Legs;
    const checkoutElem = playerNum === 1 ? p1Checkout : p2Checkout;

    // Eğer skor değiştiyse Countdown Animasyonu
    if (oldVal && oldVal.score !== newVal.score) {
        let obj = { val: oldVal.score };
        gsap.to(obj, {
            val: newVal.score,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: function () {
                scoreElem.innerText = Math.round(obj.val);
            }
        });
    } else {
        scoreElem.innerText = newVal.score;
    }

    setsElem.innerText = newVal.sets;
    legsElem.innerText = newVal.legs;

    // Checkout önerisini göster/gizle
    if (newVal.score <= 170 && checkoutRoutes[newVal.score]) {
        checkoutElem.innerText = checkoutRoutes[newVal.score];
        checkoutElem.classList.remove('hidden');
    } else {
        checkoutElem.classList.add('hidden');
    }
}

// 180 Animasyonu
nodecg.listenFor('oneEighty', () => {
    oneEightyAnim.classList.remove('hidden');
    const chars = oneEightyAnim.querySelectorAll('.char');

    // Reset before animation
    gsap.set(chars, { scale: 0, opacity: 0, rotationY: -180 });

    const tl = gsap.timeline({
        onComplete: () => {
            oneEightyAnim.classList.add('hidden');
        }
    });

    // Sequence animation: grow and rotate in
    tl.to(chars, {
        scale: 1,
        opacity: 1,
        rotationY: 0,
        duration: 0.5,
        ease: "back.out(1.5)",
        stagger: 0.2 // delay between each character
    })
        // hold for a bit, then shrink and rotate out
        .to(chars, {
            scale: 0,
            opacity: 0,
            rotationY: 180,
            duration: 0.3,
            ease: "back.in(1.5)",
            stagger: 0.1
        }, "+=1.5");
});

// Bust Animasyonu
nodecg.listenFor('bust', (data) => {
    const { player } = data;
    const box = player === 'p1' ? p1Box : p2Box;
    box.classList.remove('bust-flash'); // reset
    void box.offsetWidth; // trigger reflow
    box.classList.add('bust-flash');
});

// Win Animasyonları (Leg/Set/Match) - Basit
nodecg.listenFor('legWon', (data) => {
    const box = data.player === 'p1' ? p1Box : p2Box;
    gsap.fromTo(box, { backgroundColor: '#28a745' }, { backgroundColor: '', duration: 1, delay: 0.5 });
});

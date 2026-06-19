'use strict';

// Replicant Bağlantıları
const matchInfo = nodecg.Replicant('matchInfo');
const player1State = nodecg.Replicant('player1State');
const player2State = nodecg.Replicant('player2State');
const currentTurn = nodecg.Replicant('currentTurn');
const overlayScale = nodecg.Replicant('overlayScale', { defaultValue: 1.0 });

// DOM Elementleri
const p1NameInput = document.getElementById('p1Name');
const p1TeamInput = document.getElementById('p1Team');
const p2NameInput = document.getElementById('p2Name');
const p2TeamInput = document.getElementById('p2Team');
const setTargetInput = document.getElementById('setTarget');
const legTargetInput = document.getElementById('legTarget');
const overlayAlignmentSelect = document.getElementById('overlayAlignment');
const outchartAlignmentSelect = document.getElementById('outchartAlignment');
const hideSetsToggle = document.getElementById('hideSetsToggle');
const sponsorTextInput = document.getElementById('sponsorTextInput');
const showSponsorToggle = document.getElementById('showSponsorToggle');

const p1Score = document.getElementById('p1Score');
const p2Score = document.getElementById('p2Score');
const p1Sets = document.getElementById('p1Sets');
const p1Legs = document.getElementById('p1Legs');
const p2Sets = document.getElementById('p2Sets');
const p2Legs = document.getElementById('p2Legs');
const p1Display = document.getElementById('p1Display');
const p2Display = document.getElementById('p2Display');
const p1StatusBox = document.getElementById('p1StatusBox');
const p2StatusBox = document.getElementById('p2StatusBox');
const currentTurnDisplay = document.getElementById('currentTurnDisplay');

const scoreInput = document.getElementById('scoreInput');
const submitScoreBtn = document.getElementById('submitScoreBtn');
const undoBtn = document.getElementById('undoBtn');
const resetBtn = document.getElementById('resetBtn');
const switchTurnBtn = document.getElementById('switchTurnBtn');

const overlayScaleInput = document.getElementById('overlayScale');
const scaleDisplay = document.getElementById('scaleDisplay');

// Değerler NodeCG'den geldiğinde UI'ı güncelle
NodeCG.waitForReplicants(matchInfo, player1State, player2State, currentTurn, overlayScale).then(() => {
    
    matchInfo.on('change', (newVal) => {
        if (!newVal) return;
        p1NameInput.value = newVal.player1Name;
        if(p1TeamInput) p1TeamInput.value = newVal.player1Team || '';
        p2NameInput.value = newVal.player2Name;
        if(p2TeamInput) p2TeamInput.value = newVal.player2Team || '';
        p1Display.innerText = newVal.player1Name;
        p2Display.innerText = newVal.player2Name;
        setTargetInput.value = newVal.setTarget;
        legTargetInput.value = newVal.legTarget;
        if (overlayAlignmentSelect) overlayAlignmentSelect.value = newVal.overlayAlignment || 'left';
        if (outchartAlignmentSelect) outchartAlignmentSelect.value = newVal.outchartAlignment || 'left';
        if (hideSetsToggle) hideSetsToggle.checked = newVal.hideSets || false;
        if (sponsorTextInput) sponsorTextInput.value = newVal.sponsorText || '';
        if (showSponsorToggle) showSponsorToggle.checked = newVal.showSponsor !== false;
        updateTurnDisplay();
    });

    player1State.on('change', (newVal) => {
        if (!newVal) return;
        p1Score.innerText = newVal.score;
        p1Sets.innerText = newVal.sets;
        p1Legs.innerText = newVal.legs;
    });

    player2State.on('change', (newVal) => {
        if (!newVal) return;
        p2Score.innerText = newVal.score;
        p2Sets.innerText = newVal.sets;
        p2Legs.innerText = newVal.legs;
    });

    currentTurn.on('change', () => {
        updateTurnDisplay();
    });

    overlayScale.on('change', (newVal) => {
        if (newVal !== undefined) {
            overlayScaleInput.value = newVal;
            scaleDisplay.innerText = Number(newVal).toFixed(2);
        }
    });
});

function updateTurnDisplay() {
    if (currentTurn.value === 'p1') {
        currentTurnDisplay.innerText = matchInfo.value ? matchInfo.value.player1Name : 'Oyuncu 1';
        p1StatusBox.classList.add('active');
        p2StatusBox.classList.remove('active');
    } else {
        currentTurnDisplay.innerText = matchInfo.value ? matchInfo.value.player2Name : 'Oyuncu 2';
        p2StatusBox.classList.add('active');
        p1StatusBox.classList.remove('active');
    }
}

// Ayarları Güncelle (İsimler, Set, Leg)
document.getElementById('updateSettingsBtn').addEventListener('click', () => {
    matchInfo.value.setTarget = parseInt(setTargetInput.value, 10);
    matchInfo.value.legTarget = parseInt(legTargetInput.value, 10);
    matchInfo.value.overlayAlignment = overlayAlignmentSelect.value;
    matchInfo.value.outchartAlignment = outchartAlignmentSelect.value;
    matchInfo.value.hideSets = hideSetsToggle.checked;
    matchInfo.value.sponsorText = sponsorTextInput.value;
    matchInfo.value.showSponsor = showSponsorToggle.checked;
});

document.getElementById('updateNamesBtn').addEventListener('click', () => {
    matchInfo.value.player1Name = p1NameInput.value;
    matchInfo.value.player1Team = p1TeamInput.value;
    matchInfo.value.player2Name = p2NameInput.value;
    matchInfo.value.player2Team = p2TeamInput.value;
});

// Skor Gönderme
function submitScore(scoreValue) {
    const score = parseInt(scoreValue, 10);
    if (isNaN(score) || score < 0 || score > 180) {
        alert("Lütfen geçerli bir puan girin (0-180).");
        return;
    }
    
    // Extension tarafına mesaj gönder
    nodecg.sendMessage('addScore', {
        score: score,
        player: currentTurn.value
    });
    
    scoreInput.value = ''; // inputu temizle
    scoreInput.focus();
}

submitScoreBtn.addEventListener('click', () => {
    submitScore(scoreInput.value);
});

// Enter tuşu ile skor gönderme
scoreInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitScore(scoreInput.value);
    }
});

// Hızlı Puan Butonları
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const val = e.target.getAttribute('data-val');
        submitScore(val);
    });
});

// Sırayı Değiştir
switchTurnBtn.addEventListener('click', () => {
    currentTurn.value = currentTurn.value === 'p1' ? 'p2' : 'p1';
});

// Undo (Geri Al)
undoBtn.addEventListener('click', () => {
    if(confirm("Son işlemi geri almak istediğinize emin misiniz?")) {
        nodecg.sendMessage('undo');
    }
});

// Reset Match
resetBtn.addEventListener('click', () => {
    if(confirm("Tüm maçı (skorları ve setleri) sıfırlamak istediğinize emin misiniz?")) {
        nodecg.sendMessage('resetMatch');
    }
});

// Scale Update
overlayScaleInput.addEventListener('input', (e) => {
    overlayScale.value = parseFloat(e.target.value);
});

'use strict';

module.exports = function (nodecg) {
    // Replicants tanımlamaları
    const matchInfo = nodecg.Replicant('matchInfo', {
        defaultValue: {
            player1Name: 'Oyuncu 1',
            player2Name: 'Oyuncu 2',
            setTarget: 1,
            legTarget: 1
        }
    });

    const player1State = nodecg.Replicant('player1State', {
        defaultValue: { score: 501, legs: 0, sets: 0, dartsThrown: 0, totalScore: 0 }
    });

    const player2State = nodecg.Replicant('player2State', {
        defaultValue: { score: 501, legs: 0, sets: 0, dartsThrown: 0, totalScore: 0 }
    });

    const currentTurn = nodecg.Replicant('currentTurn', {
        defaultValue: 'p1' // 'p1' (Player 1) veya 'p2' (Player 2)
    });

    const matchHistory = nodecg.Replicant('matchHistory', {
        defaultValue: []
    });

    // Puan girildiğinde çalışacak ana mantık
    nodecg.listenFor('addScore', (data) => {
        const { score, player } = data;
        const stateRep = player === 'p1' ? player1State : player2State;
        const opponentRep = player === 'p1' ? player2State : player1State;
        
        // İşlem öncesi durumu geçmişe ekle (Undo için)
        matchHistory.value.push({
            p1: JSON.parse(JSON.stringify(player1State.value)),
            p2: JSON.parse(JSON.stringify(player2State.value)),
            turn: currentTurn.value
        });
        
        // Geçmiş limitini 50 atış olarak tut
        if (matchHistory.value.length > 50) {
            matchHistory.value.shift();
        }

        let state = stateRep.value;
        let newScore = state.score - score;

        const isBust = newScore < 0 || newScore === 1;

        // 180 kontrolü (Eğer bust olmadıysa)
        if (score === 180 && !isBust) {
            nodecg.sendMessage('oneEighty', { player });
        }

        // Bust (Batar) Durumu: 0'ın altı veya 1 (Çift ile bitme kuralı gereği 1 kalamaz)
        if (isBust) {
            nodecg.sendMessage('bust', { player });
            // Skor değişmez (eski halinde kalır), sadece atış yapılmış sayılır
            state.dartsThrown += 3;
        } 
        // Bitiş (Leg/Set kazanma)
        else if (newScore === 0) {
            nodecg.sendMessage('legWon', { player });
            state.legs += 1;
            state.dartsThrown += 3;
            state.totalScore += score;
            
            // Set kazanma kontrolü
            if (state.legs >= matchInfo.value.legTarget) {
                state.sets += 1;
                state.legs = 0;
                opponentRep.value.legs = 0;
                nodecg.sendMessage('setWon', { player });
                
                // Maç bitimi kontrolü
                if (state.sets >= matchInfo.value.setTarget) {
                    nodecg.sendMessage('matchWon', { player });
                }
            }

            // Yeni Leg için skorları sıfırla
            state.score = 501;
            opponentRep.value.score = 501;
            
            // Yeni Leg'de başlama sırasını değiştir 
            // (Dart'ta genellikle kaybeden/başlamayan sırayı alır, basitlik adına sırayı değiştiriyoruz)
        } 
        // Normal Skor Düşüşü
        else {
            state.score = newScore;
            state.totalScore += score;
            state.dartsThrown += 3;
        }

        // Sırayı diğer oyuncuya geçir
        currentTurn.value = currentTurn.value === 'p1' ? 'p2' : 'p1';
    });

    // Undo (Geri Al) işlevi
    nodecg.listenFor('undo', () => {
        if (matchHistory.value.length > 0) {
            const lastState = JSON.parse(JSON.stringify(matchHistory.value.pop()));
            player1State.value = lastState.p1;
            player2State.value = lastState.p2;
            currentTurn.value = lastState.turn;
            nodecg.sendMessage('undoAction');
        }
    });

    // Maçı sıfırlama işlevi
    nodecg.listenFor('resetMatch', () => {
        player1State.value = { score: 501, legs: 0, sets: 0, dartsThrown: 0, totalScore: 0 };
        player2State.value = { score: 501, legs: 0, sets: 0, dartsThrown: 0, totalScore: 0 };
        currentTurn.value = 'p1';
        matchHistory.value = [];
        nodecg.sendMessage('matchReset');
    });
};

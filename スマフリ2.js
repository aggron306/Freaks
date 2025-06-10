const fs = require('fs');
const readline = require('readline');
const DATA_FILE = 'my_rating.json';

let myName = '';
let myRating = 1500;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function saveMyData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ name: myName, rating: myRating }, null, 2), 'utf8');
}

function loadMyData() {
    if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        myName = data.name;
        myRating = data.rating;
    }
}

function calculateElo(myRating, oppRating, win, k = 32) {
    const expected = 1 / (1 + Math.pow(10, (oppRating - myRating) / 400));
    return Math.round(myRating + k * (win ? 1 - expected : 0 - expected));
}

function askMatch() {
    console.log(`\nあなた(${myName})の現在のレート: ${myRating}`);
    rl.question('対戦相手の名前を入力してください: ', (oppName) => {
        rl.question('対戦相手のレートを入力してください: ', (oppRatingStr) => {
            const oppRating = parseInt(oppRatingStr);
            if (isNaN(oppRating)) {
                console.log('レートは数字で入力してください。');
                return askMatch();
            }
            rl.question('勝ちましたか？ (y/n): ', (ans) => {
                const win = ans.trim().toLowerCase() === 'y';
                const newRating = calculateElo(myRating, oppRating, win);
                console.log(`結果: ${win ? '勝ち' : '負け'} → レート: ${myRating} → ${newRating}`);
                myRating = newRating;
                saveMyData();
                rl.question('\n続けますか？ (y/n): ', (cont) => {
                    if (cont.trim().toLowerCase() === 'y' || cont.trim() === '') {
                        askMatch();
                    } else {
                        console.log(`最終レート: ${myRating}`);
                        rl.close();
                    }
                });
            });
        });
    });
}

function start() {
    loadMyData();
    if (myName) {
        askMatch();
    } else {
        rl.question('あなたの名前を入力してください: ', (name) => {
            myName = name.trim();
            myRating = 1500;
            saveMyData();
            askMatch();
        });
    }
}

start();
const fs = require('fs');
let c = fs.readFileSync('page.html', 'utf8');

c = c.replace(
    /const isCoin = coins\.find\(cp => cp\[0\] === c && cp\[1\] === r\);\s*if\(isCoin\) \{\s*const coinEl = document\.createElement\('div'\);\s*coinEl\.className = 'grid-coin'; coinEl\.innerHTML = "💰";\s*coinEl\.dataset\.x = c; coinEl\.dataset\.y = r;\s*cell\.appendChild\(coinEl\);\s*coinElements\.push\(coinEl\);\s*\}/g,
    `const coinsInCell = coins.filter(cp => cp[0] === c && cp[1] === r);
                        if(coinsInCell.length > 0) {
                            const coinEl = document.createElement('div');
                            coinEl.className = 'grid-coin';
                            coinEl.innerHTML = "💰" + (coinsInCell.length > 1 ? '<span style="font-size:12px; position:absolute; bottom:-5px; right:-5px; background:#FF4D4D; color:white; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; font-weight:bold; box-shadow:0 1px 3px rgba(0,0,0,0.3); font-family:sans-serif;">' + coinsInCell.length + '</span>' : "");
                            coinEl.dataset.x = c;
                            coinEl.dataset.y = r;
                            coinEl.dataset.amount = coinsInCell.length;
                            cell.appendChild(coinEl);
                            coinElements.push(coinEl);
                        }`
);

c = c.replace(
    /el\.style\.display !== 'none' && parseInt\(el\.dataset\.x\) === playerPos\[0\] && parseInt\(el\.dataset\.y\) === playerPos\[1\]\) \{\s*el\.style\.display = 'none'; collectedCoins\+\+;/g,
    `el.style.display !== 'none' && parseInt(el.dataset.x) === playerPos[0] && parseInt(el.dataset.y) === playerPos[1]) {
                            el.style.display = 'none'; 
                            collectedCoins += parseInt(el.dataset.amount || 1);`
);

fs.writeFileSync('page.html', c);
console.log("Done");

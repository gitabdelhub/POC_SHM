const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);`;
            
const replaceStr = `            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                if (typeof Chart !== 'undefined' && Chart.instances) {
                    Object.values(Chart.instances).forEach(chart => chart.update());
                }
            }, 50);`;

if(html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync('index.html', html, 'utf8');
    console.log("Chart update added.");
} else {
    console.log("Not found.");
}

const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf-8');
const scriptStart = content.indexOf('<script>');
const scriptEnd = content.indexOf('</script>', scriptStart);
const scriptBody = content.substring(scriptStart + 8, scriptEnd);

try {
    new Function(scriptBody);
    console.log("First script parsed fine");
} catch (e) {
    console.log("First script error:", e.message);
}

const secondStart = content.indexOf('<script>', scriptEnd);
if (secondStart > -1) {
    const secondEnd = content.indexOf('</script>', secondStart);
    const secondBody = content.substring(secondStart + 8, secondEnd);
    try {
        new Function(secondBody);
        console.log("Second script parsed fine");
    } catch (e) {
        console.log("Second script error:", e.message);
    }
}

let mining = false;
let speed = 1;
let difficulty = 3;
let attempts = 0;
let blocksFound = 0;
let nonce = Math.floor(Math.random()*10000);
let blockNumber = 1;

onmessage = (e)=>{
    const data = e.data;
    if(data.type==='updateSpeed') speed = data.speed;
    if(data.type==='updateDifficulty') difficulty = data.difficulty;
    if(data.type==='start') startMining();
    if(data.type==='stop') stopMining();
};

function stopMining(){
    mining=false;
}

async function sha256(str){
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

function startMining(){
    if(mining) return;
    mining=true;

    async function mineLoop(){
        if(!mining) return;
        const interval = 1000/speed;
        attempts++;
        nonce++;
        const hash = await sha256("BlockHeader"+nonce);
        const targetPrefix = "0".repeat(difficulty);
        postMessage({mineHash:hash, attempts, blocksFound, progress:Math.min(100,(attempts/Math.pow(16,difficulty))*100)});
        if(hash.startsWith(targetPrefix)){
            blocksFound++;
            const lastBlock = {number:blockNumber++, hash, difficulty};
            postMessage({lastBlock, blocksFound, attempts:0, progress:0, mineHash:'—'});
            attempts=0;
            nonce=Math.floor(Math.random()*10000);
        }
        setTimeout(mineLoop, interval);
    }
    mineLoop();
}

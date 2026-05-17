const { open, writeFile, readFile } = require('node:fs/promises');

class PeerWare {
    constructor(peerID){this.id = peerID}
    id;
    uptime = 0.44 * Math.random()
    hiddenLength = Date.now()*52*20 * Math.random()
    volumes = []
    looks = 0 // change value to security dependent
}

function cosineSimilarity(A, B) {
    if(A.length != B.length) return 0
    
    var dotproduct = 0;
    var a = 0;
    var b = 0;

    for(var i = 0; i < A.length; i++) {
        dotproduct += A[i] * B[i];
        a += A[i] * A[i];
        b += B[i] * B[i];
    }

    return dotproduct / (Math.sqrt(a) * Math.sqrt(b)); // _^=---~ @
}

class DealWare {
    balance = 0
    lookBook
    destFile
    ticker
    price = 0.52;
    securities;
    peers;
    
    constructor({ balance, destFile }) {
        this.balance += balance
        this.peers = [new PeerWare('nero'), new PeerWare('~other')]
        this.securities = [
            {
                name: 'vei',
                industry: [0,3.4,5.2,1,3],
                lookBook: [
                    [0.2,  0.55],
                    [0.3,  0.45],
                    [0.28, 0.4]
                ],
                priceBook: [
                    0.58
                ]
            }, 
            {
                name: 'widget',
                industry: [0,1.4,4.7,4,2],
                lookBook: [
                    [1.2,  1.55],
                    [2.3,  2.55],
                    [2.28, 3.4]
                ],
                priceBook: [
                    1.54
                ]
            }    
        ]
        this.destFile = destFile
    }
    
    mine(){
        return {balance: this.balance }
    }
    
    fisherYatesShuffle(arr) {
      	for (let i = arr.length - 1; i > 0; i--) {
        	const j = Math.floor(Math.random() * (i + 1));
        	[arr[i], arr[j]] = [arr[j], arr[i]];
      	}
      	return arr;
    }
    
    async span({tkr, vol, min, max, threshold }){
        return new Promise((res) => {
            if(!threshold) threshold = 1
            let found = false // TODO: refactor
            let foundWritten = false
            this.fisherYatesShuffle(this.securities.find(el => el.name == tkr).lookBook).forEach(async (el) => {
                if(
                    min >= el[0]*(1-threshold) || min >= el[0]*(1+threshold) && max <= el[1] * (1+threshold
                    ) ||max <= el[1] * (1-threshold)
                  ){
                    this.balance = this.balance - (el[0]+el[1]) / 2
                    this.peers.forEach(async peer => {
                        if(peer.id==this.trader && !found){
                            peer.volumes.push(vol)
                            found = true
                        }
                    })
                    if(!foundWritten){
                        foundWritten = true
                        let shallowCopy = [...el]
                        shallowCopy.push(tkr)
                        await writeFile(__dirname+this.destFile+'/'+this.trader+'/'+tkr,JSON.stringify(shallowCopy)+'|',{ flag: 'a+' })
                        res()
                    }
                }
            })
        })
        
    }
    
    async maps({ src }){
        return new Promise(async (res) => {
            const data = await readFile(__dirname +src, 'utf8')
            const trades = data.slice(0,data.length-1).split('|').map(el => {
                return JSON.parse(el)
            })
            
            let found = false
            const peer = this.peers.find(peer => {
                if(peer.id==this.trader && !found){
                    peer.looks += 0.011 // TODO: don't hard code
                    found = true
                }
            })
            res(trades)
        })
    }
    
    look(security){
        // check for trader who is looking
        // collapse ongoing
        let found = false
        const peer = this.peers.find(peer => { // find what
            if(peer.id==this.trader && !found){
                peer.looks = 0
                found = true
            }
            
        })
        return this.securities.find((sec) => sec.name == security)
    }
    
    swap(a, b){
        return cosineSimilarity(a,b)
    }
    
    prep(id) {
        this.trader = id
        return this
    }
    
    view() {
        return this.looks
    }
}

(async () => {
    const dw = new DealWare({ balance: 136, destFile: '/trades' })
    
    await dw.prep('nero').span({ tkr: 'vei', vol: 2, min: 0.3, max: 1.3, threshold: 0.7 })
    await dw.prep('~other').span({ tkr: 'vei', vol: 1.4, min: 0.3, max: 1.3, threshold: 0.7 })
    
    await dw.prep('nero').maps({src: '/trades/nero/vei'})
    await dw.prep('~other').maps({src: '/trades/~other/vei'})
    
    // TODO: flex cash, presently, just a simple similiarty for industry to industry swap
    dw.prep('vei').swap(dw.securities[0].industry, dw.securities[1].industry)
    
    const u1 = dw.peers[0].uptime
    const u2 = dw.peers[1].uptime
    
    dw.peers[0].hiddenLength / (100*60*60*24*365*1000) // compute with time of holding
    
    const relativity = (a,b) => {
        return a / (a + b)
    }
    
    const wait = (ms) => new Promise((res) => setTimeout(res, ms))
    
    let upTime = 0.05
    let cosineIndustry = 0.1
    let volumes = 0.2
    let looks = 0.4
    let inTheDark = 0.25
    
    const trades1 = await dw.prep('nero').maps({src: '/trades/nero/vei'})
    const trades2 = await dw.prep('~other').maps({src: '/trades/~other/vei'})
    
    // get peer
    const volumesNero = dw.peers[0].volumes.reduce((val, curr) => val + curr, 0)
    const VolumesOther = dw.peers[1].volumes.reduce((val, curr) => val + curr, 0)
    
    const accr = () => {
        const volumesNero = dw.peers[0].volumes.reduce((val, curr) => val + curr, 0)
        const VolumesOther = dw.peers[1].volumes.reduce((val, curr) => val + curr, 0)
        const volumeRatio = volumesNero / (volumesNero + VolumesOther) 
        
        console.log('volumeRatio')
        console.log(volumeRatio)
    
        let hiddenAccruance = upTime * relativity(u1,u2) 
            + dw.prep('nero').swap(dw.securities[0].industry, dw.securities[1].industry)
            + volumesNero / (dw.prep('nero').peers[0].volumes.reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0,
            ) + dw.prep('nero').peers[1].volumes.reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0,
            )) + looks * dw.prep('nero').peers[0].looks
            + inTheDark * volumeRatio
            
        return hiddenAccruance
    }
    
    console.log('accruance')
    let counterLoop = 0
    
    while(true) {
        await wait(1000)
        await dw.prep('nero').maps({src: '/trades/nero/vei'})

        console.log(accr())
        
        ++counterLoop
        console.log(counterLoop)
        
        if(counterLoop % 8 == 0){
            console.log('after counter loop')
            await dw.prep('nero').look('vei')
            console.log(accr())
            await dw.prep('nero').span({ tkr: 'vei', vol: 2.4, min: 0.35, max: 1.1, threshold: 0.9 })
            console.log(dw.mine())
        }
    }
})()

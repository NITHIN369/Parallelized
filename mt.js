const {Worker}=require("worker_threads");
const Jimp=require("jimp")
function createWorker(workerName,wd){
    return new Promise((resolve,reject)=>{
        const worker=new Worker(workerName,{workerData:wd})
        worker.on("message",(d)=>{
            resolve(d);
        })
        worker.on("error",(err)=>{
            console.log("Error: ",err) 
            reject(err)
        })
    })
}
function geenrateoutputImg(output1,output2){
    const width=output1.bitmap.width
    const height=output1.bitmap.height
    const filteredImage = new Jimp(width, height);
    for(let x=0;x<width;x++){
        for(let y=0;y<height;y++){
            if(x<width/2){
                filteredImage.setPixelColor(output1.getPixelColor(x,y),x,y)
            }else{
                filteredImage.setPixelColor(output2.getPixelColor(x,y),x,y)
            }
        }
    }
    filteredImage.write("parallizedoutput.jpg");
}
async function start(){
console.log("Started executing in main thread");
const workerPromises=[]
workerPromises.push(createWorker("./t1.js",{imgname:"./grayscaled.jpg"}))
workerPromises.push(createWorker("./t2.js",{imgname:"./grayscaled.jpg"}))
const resu=await Promise.all(workerPromises)
Jimp.read("./output1.jpg",(err,output1)=>{
    if(err){
        console.log(err);
    }else{
        Jimp.read("./output2.jpg",async (err,output2)=>{
            geenrateoutputImg(output1,output2)
            console.log("Completed preprocessing")
        })
    }
})
}
start();
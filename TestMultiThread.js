const Jimp = require('jimp');
const { Worker, isMainThread } = require('worker_threads');

if (isMainThread) {
  // Load the input image
  Jimp.read('./noiimage.jpg', function (err, image) {
    if (err) {
      console.error(err);
      return;
    }
    // Convert the image to grayscale
    image.grayscale().write("grayscaled.jpg");
    const kernelSize = 3;
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    console.log("bitmap: ",image.bitmap)
    const filteredImage = new Jimp(width, height);
    const dr=[-1,0,1];
    const dc=[-1,0,1];
    for(let x=0;x<width;x++){
      filteredImage.setPixelColor(image.getPixelColor(0,x),0,x)
      filteredImage.setPixelColor(image.getPixelColor(height-1,x),height-1,x)
    }
    for(let x=0;x<height;x++){
      filteredImage.setPixelColor(image.getPixelColor(x,0),x,0)
      filteredImage.setPixelColor(image.getPixelColor(x,width-1),x,width-1)
    }

    // Divide the image into 4 sections
    const sectionWidth = Math.floor(width / 2);
    const sectionHeight = Math.floor(height / 2);
    const sections = [      { x: 0, y: 0, width: sectionWidth, height: sectionHeight },      { x: sectionWidth, y: 0, width: width - sectionWidth, height: sectionHeight },      { x: 0, y: sectionHeight, width: sectionWidth, height: height - sectionHeight },      { x: sectionWidth, y: sectionHeight, width: width - sectionWidth, height: height - sectionHeight }    ];

    // Spawn worker threads to process each section
    const promises = sections.map(section => {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, { workerData: { section, image } });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', code => {
          if (code !== 0) {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      });
    });

    // Wait for all worker threads to complete
    Promise.all(promises).then(results => {
      // Merge the results from each section into the final image
      for (let i = 0; i < results.length; i++) {
        const section = sections[i];
        const sectionImage = results[i];
        for (let x = section.x; x < section.x + section.width; x++) {
          for (let y = section.y; y < section.y + section.height; y++) {
            const color = sectionImage.getPixelColor(x - section.x, y - section.y);
            filteredImage.setPixelColor(color, x, y);
          }
        }
      }
      
      filteredImage.write("output.jpg");
    }).catch(err => {
      console.error(err);
    });
  });
} else {
  // Worker thread code
  const { parentPort, workerData } = require('worker_threads');
  const { section, image } = workerData;
  const sectionImage = new Jimp(section.width, section.height);
  const dr=[-1,0,1];
  const dc=[-1,0,1];
for(let x = section.x + 1; x < section.x + section.width - 1; x++) {
for(let y = section.y + 1; y < section.y + section.height - 1; y++) {
const values = [];
for(let kr = 0; kr < 3; kr++) {
for(let kc = 0; kc < 3; kc++) {
values.push(image.getPixelColor(x + dr[kr], y + dc[kc]));
}
}
values.sort();
sectionImage.setPixelColor(values[4], x - section.x, y - section.y);
}
}
parentPort.postMessage(sectionImage);
}



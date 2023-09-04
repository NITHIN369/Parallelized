const Jimp = require('jimp');
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
for(let rep=0;rep<5;rep++){
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
  for(let x=1;x<width-1;x++){
    for(let y=1;y<height-1;y++){
        const values=[];
        for(let kr=0;kr<3;kr++){
            for(let kc=0;kc<3;kc++){
                values.push(image.getPixelColor(x+dr[kr],y+dc[kc]));
            }
        }
        values.sort();
        filteredImage.setPixelColor(values[4],x,y);
    }
  }
  image=filteredImage;
}
  filteredImage.write("output.jpg")
});

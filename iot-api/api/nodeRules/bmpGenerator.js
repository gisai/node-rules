var Jimp = require('jimp');

class bmpGenerator {
    constructor(){

    }

    imageGenerator(peopleCapacity, width, height) {
        
        let image = new Jimp(width, height, 'white', (err, image) => {
                if (err) throw err
        });
          
          Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
            .then(font => {
              image.print(font, 0, 0, 'Aforo: ' + peopleCapacity);
              return image
            }).then(image => {
                console.log(image);
              let file = './img/nodeRules/peopleCapacity_' + peopleCapacity + '.bmp'
              return image.write(file) // save
            })
    }
}

module.exports = bmpGenerator;
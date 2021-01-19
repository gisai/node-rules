var Jimp = require('jimp');

class bmpGenerator {
    constructor(){}

    imageGenerator(peopleCapacity, screen) {
        
        let image = new Jimp(screen.width, screen.height, 'white', (err, image) => {
                if (err) throw err
        });
          
          Jimp.loadFont(Jimp.FONT_SANS_64_BLACK)
            .then(font => {
              image.print(font, 0, 0, 'Aforo: ' + peopleCapacity);
              return image
            }).then(image => {
              let file = './img/'+ screen._id +'_peopleCapacity.bmp';
              return image.write(file) // save
            })
    }
}

module.exports = bmpGenerator;
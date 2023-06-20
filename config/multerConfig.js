const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve("uploads/profile"))
    }
    ,
    filename: (req, file, callback) => {
        const time = new Date().getTime();

        callback(null, `${time}-${file.originalname}`)
    }
})

const imageFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/png') || file.mimetype.startsWith('image/jpeg')) {
        callback(null, true);
    } else {
        callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'O arquivo enviado não é uma imagem válida.'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024 // 1MB (tamanho máximo permitido)
    },
    fileFilter: imageFilter
});


module.exports = { storage, imageFilter, upload }

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/anexo/');
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const filename = file.originalname.replace(extension, '').toLowerCase().replace(/\s/g, '-') + '-' + Date.now() + extension;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedExtensions = ['.pdf', '.doc', '.docx']; // Defina as extensões permitidas aqui
        const extension = path.extname(file.originalname);
        if (allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo inválido. Apenas arquivos PDF, DOC e DOCX são permitidos.'));
        }
    }
});

module.exports = { upload };

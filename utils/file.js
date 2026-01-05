const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting file:', err);
        } 
    });
};

module.exports = {deleteFile};
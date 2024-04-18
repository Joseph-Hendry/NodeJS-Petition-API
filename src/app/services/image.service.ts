const getMime = (filename: string): string => {
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) return 'image/jpeg';
    if (filename.endsWith('.gif')) return 'image/gif';
    return 'application/octet-stream';
}

const getExtension = (mime: string): string => {
    switch (mime) {
        case 'image/png':
            return '.png';
        case 'image/jpeg':
            return '.jpeg';
        case 'image/gif':
            return '.gif';
        default:
            return null;
    }
};

export {getMime, getExtension}
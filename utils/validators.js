const validateEmail = (email) => {
    const re = /^(([^<>()$$$$\\.,;:\s@"]+(\.[^<>()$$$$\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
};

const validateFileType = (mimetype, allowedTypes) => {
    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            return mimetype.startsWith(type.slice(0, -2));
        }
        return type === mimetype;
    });
};

module.exports = {
    validateEmail,
    validatePassword,
    validateFileType
};
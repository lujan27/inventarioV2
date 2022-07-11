const bcrypt = require('bcryptjs');

encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = bcrypt.hash(password, salt);
    return hash;
};

matchPassword = async (password) => {
    return await bcrypt.compare(password, this.password);
};

module.exports = {
    encryptPassword,
    matchPassword
}
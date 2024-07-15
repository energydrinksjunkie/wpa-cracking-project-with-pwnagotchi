const mongoose = require('mongoose');

const handshakeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    cracked: { type: Boolean },
    password: { type: String, default: null }
});

handshakeSchema.methods.updateHandshake = async function(result) {
    this.cracked = true;
    this.password = result;

    await this.save();
    return this;
};

module.exports = mongoose.model('Handshake', handshakeSchema);

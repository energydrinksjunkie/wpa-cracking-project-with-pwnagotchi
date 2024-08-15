const mongoose = require('mongoose');

const handshakeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    status: { type: String, enum: ['Awaiting', 'In progress', 'Exhausted', 'Cracked', 'Handshake not found'], default: 'Awaiting' },
    ssid: { type: String, required: true },
    password: { type: String, default: null }
});

handshakeSchema.methods.updateHandshake = async function(result) {
    this.status = 'Cracked';
    this.password = result;

    await this.save();
    return this;
};

module.exports = mongoose.model('Handshake', handshakeSchema);

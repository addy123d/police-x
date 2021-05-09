const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = new schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    }
}, {
    collection: 'users'
})

// const model = mongoose.model('user', UserSchema);

// module.exports = model;

module.exports = User = mongoose.model('user', UserSchema);
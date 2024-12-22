const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255
    },
    category: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;

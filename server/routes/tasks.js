const express = require('express');
const Task = require('../models/tasks');
const router = express.Router();

router.get('/tasks', async (req, res) => {
    try {
        const { completed } = req.query;
        const query = {};

        if (completed !== undefined) {
            query.status = completed === 'true' ? 'completed' : { $ne: 'completed' };
        }
        const tasks = await Task.find(query);
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/tasks/categories', async (req, res) => {
    try {
        const categories = await Task.distinct('category');
        res.status(200).send(categories);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get('/tasks/categories/:catgory', async (req, res) => {
    try {
        const tasks = await Task.find({ category: req.params.catgory });
        res.status(200).send(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


router.post('/tasks', async (req, res) => {
    try{
        const task = new Task({
            description: req.body.description,
            category: req.body.category,
            status: req.body.status
        }); 
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            res.status(400).send(messages.join(', '));
        } else {
            res.status(500).send(error.message);
        }
    }
});

router.put('/tasks/:id', async (req, res) => {
    try {
        const updates = {};
        if (req.body.description) {
            updates.description = req.body.description;
        }
        if (req.body.category) {
            updates.category = req.body.category;
        }
        const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send(task);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send(error.message);
        } else {
            res.status(500).send(error.message);
        }
    }
});

router.put('/tasks/:id/complete', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.status(200).send('Task deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.delete('/deleteAll', async (req, res) => {
    try {
        await Task.deleteMany();
        res.status(200).send('All tasks deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;

// app.js

const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'blogApp';
const COLLECTION_NAME = 'blogs';

app.use(bodyParser.json());

let db, blogsCollection;

MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        db = client.db(DB_NAME);
        blogsCollection = db.collection(COLLECTION_NAME);
        console.log('Connected to MongoDB');
    })
    .catch(error => console.error('Error connecting to MongoDB:', error));

// POST /blogs: To create a new blog post
app.post('/blogs', async (req, res) => {
    try {
        const { title, body, author } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        const newBlog = {
            title,
            body,
            author,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await blogsCollection.insertOne(newBlog);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ message: 'Error creating blog' });
    }
});

// GET /blogs: To retrieve all blog posts
app.get('/blogs', async (req, res) => {
    try {
        const blogs = await blogsCollection.find({}).toArray();
        res.json(blogs);
    } catch (error) {
        console.error('Error getting blogs:', error);
        res.status(500).json({ message: 'Error getting blogs' });
    }
});

// GET /blogs/:id: To retrieve a single blog post by ID
app.get('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await blogsCollection.findOne({ _id: ObjectId(id) });
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Error getting blog by ID:', error);
        res.status(500).json({ message: 'Error getting blog by ID' });
    }
});

// PUT /blogs/:id: To update a blog post by ID
app.put('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, body, author } = req.body;
        if (!title || !body) {
            return res.status(400).json({ message: 'Title and body are required' });
        }

        const updatedBlog = {
            title,
            body,
            author,
            updatedAt: new Date()
        };

        const result = await blogsCollection.updateOne({ _id: ObjectId(id) }, { $set: updatedBlog });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Error updating blog' });
    }
});

// DELETE /blogs/:id: To delete a blog post by ID
app.delete('/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await blogsCollection.deleteOne({ _id: ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Error deleting blog' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

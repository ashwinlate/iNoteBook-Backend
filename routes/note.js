const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Note = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//ROUTE 1: Get All the Notes using:GET "/api/notes/getuser". Login required

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    console.log(req.user.id);
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

//ROUTE 2: Add a new Notes using: POST"/api/notes/getuser". Login required

router.post('/addnote', fetchuser, [

    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {

            console.log(req.user.id, "I was here in note")
            const { title, description, tag, } = req.body;
            //If there are errors,return Bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const saveNote = await note.save()

            res.json(saveNote)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    })

//ROUTE 3: Update an existing Note using: PUI"/api/notes/updatenote". Login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        
   
    //Create a newNote object
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (tag) { newNote.tag = tag };

    // Find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") }

    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true }), res.json({ note });
}catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}

})

//ROUTE 4: Delete an existing Note using:DELETE"/api/notes/deletenote". Login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    
  try {
      
 
    // Find the note to be delete and delete it
    let note = await Note.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") }

    // Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id) , res.json({ "Success": "Note has been deleted", note: note});
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
}

})


module.exports = router
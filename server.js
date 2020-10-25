const express = require('express');
const path = require('path');
const fs = require('fs');

//define port
const PORT = 3000;

//creates express application
const app = express();

//to serve static files (css and javascript)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//id counter must start at 1
//ids with 0 will not render (falsey)
let idCount = 1;

const NOTES_DATABASE = path.join(__dirname, 'db', 'db.json');

//----- Paths -----//
//Home
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
//Notes
app.get('/notes', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

//API
//get
app.get('/api/notes', function(req, res) {
  fs.readFile(NOTES_DATABASE, (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    res.json(notes);
  });
});
//post
app.post('/api/notes', function(req, res) {
  const newNote = req.body;
  fs.readFile(NOTES_DATABASE, (err, data) => {
    if (err) throw err;
    const existingNotes = JSON.parse(data);
    //to add unique id to new note
    newNote.id = idCount++;
    existingNotes.push(newNote);
    const newNoteList = JSON.stringify(existingNotes);
    fs.writeFile(path.join(__dirname, 'db', 'db.json'), newNoteList,(err) => {
      if (err) throw err;
      res.json(existingNotes);
    });
  });
});
//delete
app.delete('/api/notes/:id', function(req, res) {
  const id = parseInt(req.params.id);
  fs.readFile(NOTES_DATABASE, (err, data) => {
    if (err) throw err;
    const notes = JSON.parse(data);
    let noteIndex;
    notes.forEach(function(note, index){
      if (note.id === id) {
        noteIndex = index;
      }
    });
    notes.splice(noteIndex, 1);
    const newNoteList = JSON.stringify(notes);
    fs.writeFile(path.join(__dirname, 'db', 'db.json'), newNoteList,(err) => {
      if (err) throw err;
      res.json(notes);
    });
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on ${PORT}`);
});

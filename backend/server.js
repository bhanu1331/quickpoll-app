const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = { polls: [] };
let idCounter = 1;


app.post('/polls', (req, res) => {
  const { question, options } = req.body;

  const poll = {
    id: idCounter++,
    question,
    options: options.map(opt => ({ text: opt, votes: 0 })),
    createdAt: new Date().toISOString()
  };

  db.polls.push(poll);
  res.json(poll);
});


app.get('/polls', (req, res) => {
  res.json(db.polls);
});


app.post('/polls/:id/vote', (req, res) => {
  const poll = db.polls.find(p => p.id == req.params.id);

  if (!poll) return res.status(404).send("Poll not found");

  poll.options[req.body.optionIndex].votes++;
  res.json(poll);
});


app.delete('/polls/:id', (req, res) => {
  db.polls = db.polls.filter(p => p.id != req.params.id);
  res.send("Deleted");
});

app.listen(5000, () => console.log("Server running on port 5000"));
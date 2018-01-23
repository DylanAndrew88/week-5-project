
  const express = require('express');
  const path = require('path');
  const bodyParser = require('body-parser');
  const ejs = require('ejs');
  const fs = require('fs');
  const session = require('express-session');
  const validator = require('express-validator');

  const app = express();

  const words = fs.readFileSync("./words", "utf-8").toLowerCase().split("\n");


  //Middleware


  //View Engine (EJS)
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  //Static Path
  app.use('/public',express.static(__dirname + '/public'));

  //Body Parser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false}));

  //Validation
  app.use(validator());

  //Sessions
  app.use(session({secret: '88**88**88**88**', saveUninitialized: false, resave: false}));

  //Global Variables

  //A var to keep track of the users remaining guesses
  let guessCount = 8;

  //A var which pulls a word from the array of words for the user to guess
  let word = words[Math.floor(Math.random() *  words.length)];

  //An array which splits the users mystery word into each individual letter
  let mysteryLetter = [];
  let mysteryWord = "";
  let letter = "";

  //An array which contains every letter of the alphabet
  let alphabet = [];


  //When the user clicks the "play now" button, that initates the game and selects a random word for the player to guess
  //The random word must be divided into each of its individual letters
  //The letters in the word will appear as question marks on the screen
  for(i=0; i<word.length; i++){
  mysteryLetter[i] = "?";
  mysteryWord = mysteryLetter.join('');
  };

  //When the user guesses a letter, there should be a check to make sure it is only one character long and is a letter of the alphabet
  //After the user guesses a letter, make sure it leaves the word bank so they don't guess it again
  function letterGuess(){
    if (word.indexOf(letter) == -1) {
      guessCount -=1;
    }

  //If the user guesses a letter correctly, the mysteryWord will update with the appropriate letter now filled in
  for(i=0; i<word.length; i++){
  if (word.charAt(i) == letter) {
    mysteryLetter[i] = letter;
    }
    mysteryWord = mysteryLetter.join('');
  }
  };

  //GET and POST
  app.get('/', function (req, res){
    res.render('index', {guessCount: guessCount, mysteryWord: mysteryWord, alphabet: alphabet, success: false, errors: req.session.errors});
    req.session.errors = null;
  });

  app.get('/win', function(req, res){
    res.render('win', {mysteryWord: word})
  });

  app.get('/lose', function(req, res){
    res.render('lose', {mysteryWord: word})
  });

  app.post('/', function(req, res){
    letter = req.body.letterInput.toLowerCase();
    if (letter.length > 1) {
      return false;
    } else {
    letterGuess(letter);
    alphabet.push(letter + ', ');
    if (guessCount === 0) {
      res.redirect('/lose');
    }
    if (mysteryWord == word) {
      res.redirect('/win');
    }
    req.checkBody('letterInput', 'You must submit a letter').isAlpha();
    let errors = req.getValidationResult();
    if (errors) {
      req.session.errors = errors;
    res.render('index', {guessCount: guessCount, mysteryWord: mysteryWord, alphabet: alphabet, success: false, errors: req.session.errors});
    req.session.errors = null;
    }
    }
  });

  app.listen(process.env.PORT || 2002, function() {
  console.log(
    'Express server listening on port %d in %s mode',
    this.address().port,
    app.settings.env
    );
  });

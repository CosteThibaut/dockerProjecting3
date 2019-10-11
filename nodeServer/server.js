// Les constantes d'erreurs
const ERRORLOGIN = "Nom d'utilisateur ou mot de passe incorrect"
const ERRORDROIT = "Vous ne possédez pas les droits pour accédez à cette ressource"
// Chargement des utilitaires
var mysql = require('mysql');   // BDD
var express = require("express");
var session = require("express-session");
var bodyParser = require('body-parser');

// Connexion a la BDD
var con = mysql.createConnection({
  host: "mysqlbase",
  user: "root",
  password: "jack",
  database: "jack1",
  port:3306
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connecté a la BDD");
});


// Creation de l'app
var app = express();
app.use(express.static(__dirname + '/src'));
app.set('views', __dirname + '/views');
app.engine('ejs', require('ejs').renderFile);

// Creation du serveur
var server = require('http').createServer(app);

// Initialisation du middleware de session
app.use(session({
    secret: "jzdapdkaz#%xsksLLQ&",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

// Initialisation du middleware body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var sess;


// Routage
app.get('/',function(req, res) {
  sess = req.session;
  if (sess.username) {
    res.render('home.ejs',{info : [sess.username,sess.droit,sess.name,sess.surname]});
  }
  else{
    if (sess.alerte) {
      var text = sess.alerte;
      sess.alerte='none';      
      res.render('login.ejs',{alerte : text});
    }
    else{
      res.render('login.ejs')
    }
  }
});

// Modification Utilisateur
app.post('/Admin/modifUser',function(req, res) {
  sess = req.session;
  if (sess.username) {
    if (sess.droit==1) {
      var sql = "UPDATE user SET username ='"+req.body.username+"' , surname ='"+req.body.surname+"' , name ='"+req.body.name+"' , pwd ='"+req.body.pwd+"' , droit ='"+req.body.droit+"' WHERE id ="+req.body.id;
      var sql2 = "UPDATE user SET username ='"+req.body.username+"' , surname ='"+req.body.surname+"' , name ='"+req.body.name+"' , droit ='"+req.body.droit+"' WHERE id ="+req.body.id;
      
      if (req.body.pwd=="") {
        sql=sql2;
      }

      con.query(sql, function (err, result){
        res.redirect('/Admin');        
      });
    }
    else{
      res.redirect('/');
    }
  }
  else{
    res.redirect('/');    
  }
});


// Modification Utilisateur
app.post('/Admin/addUser',function(req, res) {
  sess = req.session;
  if (sess.username) {
    if (sess.droit==1) {
      var sql = "INSERT INTO user (username , surname , name , pwd , droit) VALUES ('"+req.body.username+"' , '"+req.body.surname+"' , '"+req.body.name+"' , '"+req.body.pwd+"' , '"+req.body.droit+"')";

      con.query(sql, function (err, result){
        res.redirect('/Admin');        
      });
    }
    else{
      res.redirect('/');
    }
  }
  else{
    res.redirect('/');    
  }
});


// Page admin
app.get('/Admin',function(req, res) {
  sess = req.session;
  if (sess.username) {
    if (sess.droit==1) {
      con.query("SELECT username, droit, name, surname ,id FROM user", function (err, result, fields){
        var users = result;
        res.render('admin.ejs',{info : [sess.username,sess.droit,sess.name,sess.surname],users : users});        
      });
    }
    else{
      res.redirect('/');
    }
  }
  else{
    res.redirect('/');    
  }
});


// Page admin
app.get('/Project',function(req, res) {
  sess = req.session;
  if (sess.username) {
    res.render('project.ejs',{info : [sess.username,sess.droit,sess.name,sess.surname]});
  }
  else{
    res.redirect('/');    
  }
});


// Le login post
app.post('/login',function(req,res){
  sess = req.session;
  con.query("SELECT pwd, droit, name, surname FROM user where username ='"+req.body.username+"'", function (err, result, fields){
    if (result == '') {
      sess.alerte=ERRORLOGIN;
    }
    else{
      if (result[0].pwd == req.body.pwd) {
        sess.username=req.body.username;
        sess.droit=result[0].droit;
        sess.name=result[0].name;
        sess.surname=result[0].surname;
      }
    }
  res.redirect('/');
  });
});

// Le logout
app.get('/logout',function(req,res){
  req.session.destroy(function(err) {
    if(err) {!
      console.log(err);
    }
    else {
      res.redirect('/');
    }
  });
});

// Gestion mauvais routage
app.use(function(req, res, next){
  res.render('error404.ejs')
});

server.listen(5000);
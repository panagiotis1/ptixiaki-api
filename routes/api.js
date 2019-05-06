const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const mysql = require('mysql');
const con = mysql.createConnection({
	host: "www.db4free.net",
	user: "bakavos",
	password: "panouliosXA15",
	database: "bakavosdatabase"
});
con.connect(function (err) {
	if (err) {
		console.log("couldn't connect");
	}
	else{
		console.log("Connected!");
	}
});

function verifyToken(req, res, next) {
	if(!req.headers.authorization){
		return res.status(401).send('Unauthorized request');
	}
	let token = req.headers.authorization.split(' ')[1];
	if(token === 'null'){
		return res.status(401).send('Unauthorized request');
	}
	try{
		let payload = jwt.verify(token, 'secretKeygdsuifadbdsfuhafdgyifa3125qeas');
		if(!payload){
			return res.status(401).send('Unauthorized request');
		}
		req.userId = payload.id;
		req.userPosition = payload.position;
	}catch(err){
			return res.status(401).send('Unauthorized request');
	}
	next();
}

router.get('/', (req, res) => {
	res.send('From API route');
});

router.get('/home-page', (req, res) => {	
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "SELECT articles.*, users.name, users.surname\n"+
				"FROM users INNER JOIN articles\n"+
				"ON articles.userID=users.ID;";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			res.send("some error with database");
		}
		else {
			res.status(200).send(result);
		}
	});
});

router.get('/podosfairo', (req, res) => {
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "SELECT articles.*, users.name, users.surname\n"+
				"FROM users INNER JOIN articles\n"+
				"ON articles.userID=users.ID\n"+
				"WHERE categoryID=1;";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			res.send("some error with database");
		}
		else {
			res.status(200).send(result);
		}
	});
});

router.get('/basket', (req, res) => {
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "SELECT articles.*, users.name, users.surname\n"+
					"FROM users INNER JOIN articles\n"+
					"ON articles.userID=users.ID\n"+
					"WHERE categoryID=2;";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			res.send("some error with database");
		}
		else {
			res.status(200).send(result);
		}
	});
});

router.post('/login', (req, res) => {
	if (!req.body) {
		return res.status(400).send('Κάτι πήγε στραβά. Δοκιμάστε αργότερα');
	}
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "SELECT * FROM users WHERE email="+mysql.escape(req.body.email)+";";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			res.status(401).send('Κάποιο σφάλμα με τον server');
		}
		else if (result.length===1) {
			if (result[0].password === req.body.password) {
				let payload = { "id": result[0].ID, "position": result[0].position};
				let token = jwt.sign(payload, 'secretKeygdsuifadbdsfuhafdgyifa3125qeas');
				res.status(200).send({token, "position":result[0].position});
			}
			else {
				res.status(401).send('Λάθος Κωδικός');
			}
		}
		else {
			res.status(401).send('Λάθος Email');
		}
	});
});

router.post('/register', (req, res) => {
	if (!req.body){
		return res.sendStatus(400);
	}
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "INSERT INTO users (email, password, name, surname,\n"+
			"phonenumber, registrationDate, position)\n"+
			"VALUES (\n"+
				mysql.escape(req.body.email)+",\n"+
				mysql.escape(req.body.password)+", \n"+
				mysql.escape(req.body.name)+", \n"+
				mysql.escape(req.body.surname)+", \n"+
				mysql.escape(req.body.phonenumber)+", \n"+
				"NOW(), \n"+
				"'Αρθρογράφος'\n"+
			");";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			res.status(400).send('Το email χρησιμοποιείται ήδη ή υπάρχει πρόβλημα με τη βάση.');
		}
		else {
			res.status(200).send({"message":'Η εγγραφή με το email "'+req.body.email+'" έγινε με επιτυχία!'});
		}
	});
});

router.get('/auth-check', verifyToken, (req, res) => {	
	res.status(200).send({"Message":"OK"});
});

router.get('/admin-check', verifyToken, (req, res) => {
	if(req.userPosition=="Διαχειριστής"){
		res.status(200).send({"Message":"OK"});
	}else{
		res.status(401).send('Unauthorized request');
	}
});

router.get('/get-categories', (req, res) => {
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "SELECT title FROM `categories`";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			console.log("Some error");
		}
		else{
			res.status(200).send(result);
		}
	});
});

router.post('/create-article', verifyToken, (req, res) => {
	if (!req.body) {
		return res.sendStatus(400);
	}
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "INSERT INTO articles (userID, categoryID, title, description, \n"+
			"keywords, article, creationDate, lastUpdateDate) \n"+
			"VALUES ( \n"+
				req.userId+", \n"+
				"(SELECT ID FROM `categories` \n"+
					"WHERE title="+mysql.escape(req.body.category)+"), \n"+
				mysql.escape(req.body.title)+", \n"+
				mysql.escape(req.body.description)+", \n"+
				mysql.escape(req.body.keywords)+", \n"+
				mysql.escape(req.body.article)+", \n"+
				"NOW(),\n"+
				"NOW()\n"+
			");";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			res.status(400).send('Το άρθρο δεν μπόρεσε να δημιουργηθεί.');
		}
		else {
			res.status(200).send({"message":'Το άρθρο με τίτλο "'+req.body.title+'" δημιουργήθηκε με επιτυχία!'});
		}
	});
});

router.post('/search-article', verifyToken, (req, res) => {
	if (!req.body) {
		return res.sendStatus(400);
	}
	if (req.body.searchdatefrom==="") {
		req.body.searchdatefrom="1900-01-01";
	}
	if (req.body.searchdateto==="") {
		req.body.searchdateto="2200-01-01";
	}
	var categ = "";
	if (req.body.category!=="Διάλεξε κατηγορία") {
		categ= " AND c.title LIKE "+mysql.escape(req.body.category)+"";
	}
	console.log("~~~~~~~~~~~~~~~~~");
		var qu ="SELECT\n"+
					"a.ID,\n"+
					"a.userID,\n"+
					"c.title as 'category',\n"+
					"a.title,\n"+
					"a.description,\n"+
					"a.keywords,\n"+
					"a.article,\n"+
					"DATE_FORMAT(a.creationDate, '%d/%m/%Y') AS 'creationDate',\n"+
					"DATE_FORMAT(a.lastUpdateDate, '%d/%m/%Y') AS 'lastUpdateDate'\n"+
				"FROM articles AS a LEFT JOIN categories AS c\n"+
				"ON a.categoryID = c.ID\n"+
				"WHERE\n"+
					"a.title LIKE "+mysql.escape("%"+req.body.title+"%")+"\n"+
					"AND a.keywords LIKE "+mysql.escape("%"+req.body.keywords+"%")+"\n"+
					"AND a.creationDate BETWEEN "+mysql.escape(req.body.searchdatefrom)+"\n"+
						"AND "+mysql.escape(req.body.searchdateto)+"\n"+
					"AND userID="+req.userId+categ+"\n"+
				"ORDER BY a.ID;";
		console.log(qu);
		con.query(qu, function (err, result, fields) {
			if (err) {
				console.log("Some error...");
			}
			else {
				res.status(200).send(result);
			}
		});
});

router.post('/edit-article', verifyToken, (req, res) => {
	if (!req.body) {
		return res.sendStatus(400);//not handled.
	}
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "UPDATE articles SET categoryID=(SELECT ID FROM `categories` WHERE\n"+
				"title="+mysql.escape(req.body.category)+"),\n"+
				"title="+mysql.escape(req.body.title)+",\n"+
				"description="+mysql.escape(req.body.description)+",\n"+
				"keywords="+mysql.escape(req.body.keywords)+",\n"+
				"article="+mysql.escape(req.body.article)+",\n"+
				"lastUpdateDate=NOW() WHERE ID="+mysql.escape(req.body.ID)+";";
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			console.log("some error occured");//not handled.
		}
		else{
			if(result.affectedRows===1){
				res.status(200).send({"test":"OK"});
			}
		}
	});
});

router.post('/delete-article', verifyToken, (req, res) => {
	if(!req.body) {
		return res.sendStatus(400);
	}
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "DELETE FROM `articles` WHERE ID="+mysql.escape(req.body.ID)+";";
	console.log(qu);
	con.query(qu, function(err, result, fields){
		if (err) {
			console.log("Error...");
			res.sendStatus(400);
		}
		else{
			res.status(200).send({"test":"OK"});
		}
	});
});

router.post('/search-user', verifyToken, (req, res) => {
	if(req.userPosition=="Διαχειριστής"){
	if (!req.body) {
		return res.sendStatus(400);
	}
	console.log("~~~~~~~~~~~~~~~~~");
	var qu = "SELECT * FROM `users` WHERE `email` LIKE "+mysql.escape("%"+req.body.email+"%")+";"
	console.log(qu);
	con.query(qu, function (err, result, fields) {
		if (err) {
			console.log("Some error...");//not handled
		}
		else {
			res.status(200).send(result);
		}
	});
	}else{
		res.status(401).send('Unauthorized request');
	}
});

router.post('/edit-user', verifyToken, (req, res) => {
	if(req.userPosition=="Διαχειριστής"){
		if (!req.body) {
			return res.sendStatus(400);
		}
		console.log("~~~~~~~~~~~~~~~~~");
		var qu = "UPDATE users SET  email="+mysql.escape(req.body.email)+",\n"+
					"password="+mysql.escape(req.body.password)+",\n"+
					"name="+mysql.escape(req.body.name)+",\n"+
					"surname="+mysql.escape(req.body.surname)+",\n"+
					"position="+mysql.escape(req.body.position)+",\n"+
					"phonenumber="+mysql.escape(req.body.phonenumber)+"\n"+
					"WHERE ID="+mysql.escape(req.body.ID)+";";
		console.log(qu);
		con.query(qu, function (err, result, fields) {
			if (err) {
				console.log("some error!");//not handled
			}
			else{
				if(result.affectedRows===1){
					res.status(200).send({"test":"OK"});
				}
			}
		});
	}else{
		res.status(401).send('Unauthorized request');
	}
});

router.post('/delete-user', verifyToken, (req, res) => {
	if(req.userPosition=="Διαχειριστής"){
		if(!req.body) {
			return res.sendStatus(400);
		}
		console.log("~~~~~~~~~~~~~~~~~");
		var qu = "DELETE FROM `users` WHERE ID="+mysql.escape(req.body.ID)+";";
		console.log(qu);
		con.query(qu, function(err, result, fields){
			if (err) {
				res.sendStatus(400);
			}
			else{
				res.status(200).send({"test":"OK"});
			}
		});
	}else{
		res.status(401).send('Unauthorized request');
	}
});

module.exports = router;

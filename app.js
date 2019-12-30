const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
app.set('view engine', 'ejs')
app.use(session({secret: 'secret',saveUninitialized: false,resave: true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/uploads'))
app.use(express.static(__dirname + '/avatars'))
app.use(express.static(__dirname + '/styles'))
app.use(express.static(__dirname + '/scripts'))

//mongoose.connect('mongodb://localhost:27017/project', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb://uonegqmvvqcfy5opfqra:eEPNckV9G7Pzzmc0QeNN@bqreou92suoisqv-mongodb.services.clever-cloud.com:27017/bqreou92suoisqv', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', function() {
    console.log("Conectat");
});

mongoose.connection.on('error', function(err) {
    console.log('Eroare ' + err);
});

var storageEngine = multer.diskStorage({
	destination: 'uploads/',
	filename: function(req,file,cb){
		cb(null,Date.now().toString() + path.extname(file.originalname));
	}
});

var storageAvatars = multer.diskStorage({
	destination: 'avatars/',
	filename: function(req,file,cb){
		cb(null,Date.now().toString() + path.extname(file.originalname));
	}
});

var upload = multer({
	storage: storageEngine,
	limits: {fileSize: 2000000},
	fileFilter: function(req,file,cb){
		validateFile(req,file,cb);
	}
}).single("photo");

var uploadAvatar = multer({
	storage: storageAvatars,
	limits: {fileSize: 2000000},
	fileFilter: function(req,file,cb){
		validateAvatar(file,cb);
	}
}).single("photo");

var validateFile = function(req,file,cb){
	if(!req.body.caption){
		return cb("Titlul nu poate fi gol");
	}
	if(!req.body.category){
		return cb("Categorie vida");
	}
	allowedFileTypes = /jpeg|jpg|png|gif/;
	const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimeType  = allowedFileTypes.test(file.mimetype);
	if(extension && mimeType){
	  return cb(null, true);
	}else{
	  cb("Tip invalid")
	}
}

var validateAvatar = function(file,cb){
	allowedFileTypes = /jpeg|jpg|png|gif/;
	const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
	const mimeType  = allowedFileTypes.test(file.mimetype);
	if(extension && mimeType){
	  return cb(null, true);
	}else{
	  cb("Tip invalid")
	}
}

var generalSchema = new mongoose.Schema({
	array: [String]
},{ versionKey: false });

var UserSchema = new mongoose.Schema({
	name: String,
	password: String,
	avatar: String,
	admin: Boolean,
	profile: {
		sex: String,
		music: [String],
		color: String,
		category: String,
		bio: String,
	},
	likes: [mongoose.Schema.Types.ObjectId],
	dislikes: [mongoose.Schema.Types.ObjectId],
	clikes: [mongoose.Schema.Types.ObjectId],
	cdislikes: [mongoose.Schema.Types.ObjectId]
},{ versionKey: false });

var photoSchema = new mongoose.Schema({
	path: String,
	caption: String,
	category: String,
	votes: Number,
	date: { type: Date, default: Date.now },
	comments: [{user_id: mongoose.Schema.Types.ObjectId, user_name: String, message: String, votes: Number}]
},{ versionKey: false });

var User = mongoose.model('User',UserSchema);
var Photo = mongoose.model('Photo',photoSchema);
var General = mongoose.model('General',generalSchema,'general');

function createUser(name,password){
	User.create({
		name: name,
		password: password,
		avatar: "",
		admin: false,
		likes: [],
		dislikes: [],
		clikes: [],
		cdislikes: []
	}, function(err){
		if(err) console.log(err);
	});
}

app.post('/sign_up',function(req,res){
	var name = req.body.name;
	var password = req.body.password;
	var password2 = req.body.password2;
	if( !name || !password){
		res.send("Campurile nu pot fi goale");
		return;
	}
	if(password !== password2){
		res.send("Parolele nu coincid");
		return;
	}
	
	User.findOne({name: name},'name',function(err,doc){
		if(doc){
			res.send("Numele deja exista");
			return;
		}else{
			bcrypt.hash(password, 10, function(err, hash) {
				createUser(name,hash);
				res.send("Inregistrare efectuata");
			});
		}
	});
});

app.post('/log_in',function(req,res){
	var name = req.body.name;
	var password = req.body.password;
	User.findOne({name: name},'_id name password admin', function(err,doc){
		if(doc){
			bcrypt.compare(password, doc.password, function(err,result){
				if(result){
					req.session.user = {};
					req.session.user._id = doc._id;
					req.session.user.name = doc.name;
					req.session.user.admin = doc.admin
					res.send("corect");
				}else{
					res.send("Parola sau nume gresit");
				}
			});
		}else{
			res.send("Nume sau parola gresita");
		}
	});
});

app.post('/upload',function(req,res){
	upload(req,res,function(err){
		if(err){
			res.send(err);
		}else{
			if(req.file == undefined){
				res.send("Selectati un fisier");	
			}else{
				var fullPath = req.file.filename;
				
				var doc = {
					path: fullPath,
					caption: req.body.caption,
					category: req.body.category,
					votes: 0
				};
				
				var photo = new Photo(doc);
				photo.save(function(err){
					if(err){
						console.log(err);
					}
				res.send("Incarcare efectuata cu succes");
				});
			}
		}
	})
});

app.get('/get_posts',function(req,res){
	if(req.session.user){
		if(!req.query.option || req.query.option == "Hot"){
			Photo.find({},"-comments",{sort: { votes: 'desc' },limit: 10,skip: Number(req.query.skip)},function(err,docs){
				if(err)
					console.log(err);
				if(docs){
					res.setHeader('Content-Type', 'application/json');
					res.send(docs);
				}
			});
		}else{
			if(req.query.option == "Fresh"){
				Photo.find({},"-comments",{sort: { date: 'desc' },limit: 10,skip: Number(req.query.skip)},function(err,docs){
					if(err)
						console.log(err);
					if(docs){
						res.setHeader('Content-Type', 'application/json');
						res.send(docs);
					}
				});
			}else{
				Photo.find({category: req.query.option},"-comments",{sort: { votes: 'desc' },limit: 10,skip: Number(req.query.skip)},function(err,docs){
					if(err)
						console.log(err);
					if(docs){
						res.setHeader('Content-Type', 'application/json');
						res.send(docs);
					}
				});
			}
		}
	}else{
		res.render('login');
	}
});

app.get('/get_categories',function(req,res){
	General.findOne({},function(err,doc){
		if(err) console.log(err);
		if(doc){
			res.setHeader('Content-Type', 'application/json');
			res.send(doc.array);
		}
	});
});

function updatePhotoVotes(id,vote){
	Photo.findByIdAndUpdate(id,{ $inc:{votes: vote} },{new: true, useFindAndModify: false},function(err,response){
							if(err) console.log(err);
	});
}

app.get('/vote',function(req,res){
	if(req.session.user){
		User.findById(req.session.user._id,'-password',function(err,doc){
			if(doc){
				var like = doc.likes.findIndex(function(id){
					return req.query.id == id;
				});
				var dislike = doc.dislikes.findIndex(function(id){
					return req.query.id == id;
				});
				if(like == -1 && dislike == -1){
					if(Number(req.query.vote)){
						doc.likes.push(req.query.id);
						updatePhotoVotes(req.query.id,1);
						res.send('l');
					}else{
						doc.dislikes.push(req.query.id);
						updatePhotoVotes(req.query.id,-1);
						res.send('d');
					}
				}
				if(like >= 0){
					doc.likes.splice(like,1);
					updatePhotoVotes(req.query.id,-1);
					res.send('ul');
				}
				if(dislike >= 0){
					doc.dislikes.splice(dislike,1);
					updatePhotoVotes(req.query.id,1);
					res.send('ud');
				}
				doc.save( function(err){if(err) console.log(err);});
			}
		});
	}else{
		res.render('login');
	}
});

function updatePhotoCommentVotes(photo_id,id,vote){
	Photo.findById(photo_id,function(err,doc){
			if(err) console.log(err);
			if(doc){
				var index = doc.comments.findIndex(function(object){
					return object._id == id;
				});
				doc.comments[index].votes += vote;
				doc.save(function(err){if(err) console.log(err);});
			}else{
				res.render('eroare',{mesaj: "Postarea nu exista"});
			}
	});
}

app.get('/vote_comment',function(req,res){
	if(req.session.user){
		User.findById(req.session.user._id,'-password',function(err,doc){
			if(doc){
				var like = doc.clikes.findIndex(function(id){
					return req.query.id == id;
				});
				var dislike = doc.cdislikes.findIndex(function(id){
					return req.query.id == id;
				});
				if(like == -1 && dislike == -1){
					if(Number(req.query.vote)){
						doc.clikes.push(req.query.id);
						updatePhotoCommentVotes(req.query.pid,req.query.id,1);
						res.send('l');
					}else{
						doc.cdislikes.push(req.query.id);
						updatePhotoCommentVotes(req.query.pid,req.query.id,-1);
						res.send('d');
					}
				}
				if(like >= 0){
					doc.clikes.splice(like,1);
					updatePhotoCommentVotes(req.query.pid,req.query.id,-1);
					res.send('ul');
				}
				if(dislike >= 0){
					doc.cdislikes.splice(dislike,1);
					updatePhotoCommentVotes(req.query.pid,req.query.id,1);
					res.send('ud');
				}
				doc.save( function(err){if(err) console.log(err);});
			}
		});
	}else{
		res.render('login');
	}
});


app.post('/comment',function(req,res){
	if(req.session.user){
		Photo.findById(req.body.pid,function(err,doc){
			if(err) console.log(err);
			if(doc){
				var comment = {
					user_id: req.session.user._id,
					user_name: req.session.user.name,
					message: req.body.message,
					votes: 0
				}
				doc.comments.push(comment);
				doc.save( function(err){if(err) console.log(err);});
				res.send("Comentariu postat");
			}else{
				res.send("Postarea nu exista");
			}
		});
	}else{
		res.render('login');
	}
});

app.get('/comments',function(req,res){
	if(req.session.user){
		Photo.findById(req.query.post,function(err,doc){
			if(err) console.log(err);
			if(doc){
				res.render('comments',{post: doc});
			}else{
				res.render('eroare',{mesaj: "Postarea nu exista"});
			}
		});
	}else{
		res.render('login');
	}
});

app.get('/account',function(req,res){
	if(req.session.user){
		User.findById(req.query.id?req.query.id:req.session.user._id,'name likes profile avatar',function(err,doc){
			if(err) console.log(err);
			if(doc){
				Photo.find({
				'_id': { $in: doc.likes}
				},{_id: 0, path: 1, caption: 1},{sort: {date: -1},limit: 10},function(err,docs){
					if(err) console.log(err);
					res.render('account',{user: doc,paths: docs});
				});
			}else{
				res.render('eroare',{mesaj: "Userul nu exista"});
			}
		});
	}else{
		res.render('login');
	}
});

app.post('/update_profile',function(req,res){
	uploadAvatar(req,res,function(err){
		if(err){
			res.send(err);
		}else{
			User.findById(req.session.user._id,function(err,doc){
				if(err) console.log(err);
				if(req.file){
					fs.unlinkSync("./avatars/"+doc.avatar);
					doc.avatar = req.file.filename;
				}
				if(req.body.sex) doc.profile.sex = req.body.sex;
				if(req.body.music) doc.profile.music = JSON.parse(`[${req.body.music}]`);
				if(req.body.color) doc.profile.color = req.body.color;
				if(req.body.category) doc.profile.category = req.body.category;
				if(req.body.bio) doc.profile.bio = req.body.bio;
				doc.save(function(err){
					if(err) console.log(err);
				});
				res.send("Update efectuat cu succes");
			});
		}
	});
});

app.delete('/delete_post',function(req,res){
	if(req.session.user.admin){
		Photo.findByIdAndRemove(req.query.post,{new: true, useFindAndModify: false},function(err,doc){
			if(err) console.log(err);
			if(doc){
				fs.unlinkSync("./uploads/"+doc.path);
			}else{
				res.render('eroare',{mesaj: "Postarea nu exista"});
			}
		});
	}else{
		res.send("Nu sunteti admin");
	}
});

app.delete('/delete_comment',function(req,res){
	if(req.session.user.admin){
		Photo.findById(req.query.pid,function(err,doc){
			if(err) console.log(err);
			if(doc){
				var index = doc.comments.findIndex(function(object){
					return object._id == req.query.id;
				});
				doc.comments.splice(index,1);
				doc.save( function(err){if(err) console.log(err);});
			}else{
				res.send("Postarea nu exista");
			}
		});
	}else{
		res.send("Nu sunteti admin");
	}
});

app.get('/',function (req,res){
	if(req.session.user){
		User.findById(req.session.user._id,'-password',function(err,doc){
			if(err) console.log(err);
			if(doc) res.render('home',{user: doc});
		});
		
	}else{
		res.render('login');
	}
});

app.get('/log_out',function(req,res){
	req.session.destroy();
	res.redirect('/');
});

app.delete('/delete_user',function(req,res){
	User.findByIdAndRemove(req.session.user._id,{new: true, useFindAndModify: false},function(err,doc){
		if(err) console.log(err);
		req.session.destroy();
		res.status(200).end();
	});
});

app.get('/despre',function(req,res){
	res.render('despre');
});

app.use(function(req,res){
    res.status(404).render('eroare',{mesaj: "404 - Pagina cautata nu exista"});
});

app.listen(8080);
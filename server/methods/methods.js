var bcrypt = Meteor.npmRequire('bcrypt');
var redis = Meteor.npmRequire('redis');




var client1 = new redis.createClient("7000","localhost", {retry_strategy:function (options) {
        if (options.error.code === 'ECONNREFUSED') {
			console.log(new Error('The server 1 refused the connection'));
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
            return undefined;
        }
        return Math.max(options.attempt * 100, 3000);
    }});
var client2 = new redis.createClient("7001", "localhost" , {retry_strategy:function (options) {
        if (options.error.code === 'ECONNREFUSED') {
			console.log(new Error('The server 2 refused the connection'));
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
            return undefined;
        }
        return Math.max(options.attempt * 100, 3000);
    }});
var client3 = new redis.createClient("7002", "localhost", {retry_strategy:function (options) {
        if (options.error.code === 'ECONNREFUSED') {
			console.log(new Error('The server 3 refused the connection'));
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
        }
        if (options.times_connected > 10) {
            return undefined;
        }
        return Math.max(options.attempt * 100, 3000);
    }});

  let geted = false;

    client1.on("connect", function () {
        console.log("Client 1 connected: Grats!!! ");
    });
    client2.on("connect", function () {
        console.log("Client 2 connected: Grats!!! ");
    });
    client3.on("connect", function () {
        console.log("Client 3 connected: Grats!!! ");
    });
    client1.on("error", function (err) {
          console.log("Client 1 ERROR!!!!! ERROR, KARL!!! ");
    });
    client3.on("error", function (err) {
          console.log("Client 3 ERROR!!!!! ERROR, KARL!!! ");
    });
    client2.on("error", function (err) {
          console.log("Client 2 ERROR!!!!! ERROR, KARL!!! ");
    });


Meteor.methods({
  PostInsert : function (post, author) {
    post.date= new Date();
    post.author = author;

    Posts.insert(post);
    var t = Posts.findOne(post);
    Anon.insert({post : t._id, author : author, name : "автор"});
},
putInRedis : (key, value) => {
  let seted = false;
  if(client1.connected) {client1.set(key, value);seted=true;}
  if(client2.connected) {client2.set(key, value);seted=true;}
  if(client3.connected) {client3.set(key, value);seted=true;}
  return seted;
},
getFormRedis : (key) => {
  var res;
  if(client1.connected) {client1.get(key,(e,r)=>{
    if (r) geted = r;
  });}
  else
  {
    if(client2.connected) {client1.get(key,(e,r)=>{
    if (r) geted = r;
  });}
  else
  {
  if(client3.connected) {client1.get(key,(e,r)=>{
    if (r) geted = r;
  });}
  else return false;
}
}
res = geted;
geted = false;
  return res;
},
delFromRedis : (key) => {
    let seted = false;
  if(client1.connected) {client1.del(key);seted = true;}
  if(client2.connected) {client2.del(key);seted = true;}
  if(client3.connected) {client3.del(key);seted = true;}
    
    
  return seted;
},
AnswerInsert : function(answer)
{
  answer.date= new Date();
  var a = answer.author;
  var p = answer.post;
  if (Anon.findOne({post : p, author : a}))
  answer.name = Anon.findOne({post : p, author : a}).name;
  else {var t = "пользователь"+Anon.find({post : p}).count(); Anon.insert({post : p, author : a, name : t});
  answer.name = t;}
  answer.favorite = false;
  Answers.insert(answer);
},
PostAuthor : function(id, auth)
{
  if(Posts.find({_id : id, author : auth}).count() == 1) return true;
  return false;
},
AnswerRem : function(answer)
{
  Answers.remove(answer);
},
PostRem : function(id)
{
  Answers.remove({post : id});
  Anon.remove({post : id});
  Posts.remove({_id:id});
},
nf : function(id)
{
  Answers.update({_id : id},{$set : {favorite : false}});
},
favorite : function(id, post)
{
  var t = Answers.findOne({post : post, favorite : true});
  if (t) {
    Answers.update({_id : t._id},{$set : {favorite : false}});
    Answers.update({_id : id},{$set : {favorite : true}});
  }
  else
  {
  Answers.update({_id : id},{$set : {favorite : true}});
}
},
boss : function(post,author,type)
{
  if(type == 1)
  {
  var author;
  if(Posts.find({_id : post, author : author}).count() == 1) author=true;
  else author=false;
  var answers = Answers.find({post : post}).count();
  var likesPlus = Likes.find({post : post, num : 1, type : 1}).count();
  var likesMinus = Likes.find({post : post, num : 0, type : 1}).count();
  return result={
    "author" : author,
    "answers" : answers,
    "likes" : likesPlus-likesMinus
  };
}
else {
    var author;
    if(Answers.find({_id : post, author : author}).count() == 1) author=true;
    else author=false;
    var answers = Answers.find({post : post}).count();
    var likesPlus = Likes.find({post : post, num : 1, type : 0}).count();
    var likesMinus = Likes.find({post : post, num : 0, type : 0}).count();
    return result={
      "author" : author,
      "likes" : likesPlus-likesMinus
    };
  }

},
register : function(user){
  const saltRounds = 10;
  var hash = bcrypt.hashSync(user.password, saltRounds);
  return Users.insert({"_id" : user.name, "password" : hash});
},
login : function(user){
  var u = Users.findOne({"_id" : user.name});
  if(bcrypt.compareSync(user.password, u.password)) return u;
  else return false;
},
like : function(post, liker, num,type){
  return Likes.insert({post : post, author : liker, num : num, type : type});
},
liked : function(post, liker, type)
{
  if(type == 1)
  {
  if(Likes.find({post : post, author : liker, type : 1}).count() > 0)
  return true;
}
  else return false;
  if(type == 0)
  {
  if(Likes.find({post : post, author : liker, type : 0}).count() > 0)
  return true;
  }
  else return false;
}
});

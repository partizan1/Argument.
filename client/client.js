
Template.postsAdd.events({
  'click #subQ': function(e) {
    e.preventDefault();
var theme= $('[name=theme]').val();
var question= $('[name=question]').val();
if(theme != '' && question != ''){
    var post = {
      "question": question
    };
    Meteor.call("PostInsert", post, Session.get("User"));
    $(
      '[name=theme]').val('');
      $('[name=question]').val('');
  }
}});
Template.postPage.helpers({
  login : function(){return Session.get("login");
},
List:function(){ return true;}
});
Template.layout.helpers({
  login : function(){return Session.get("login");
},
currentUser: function(){return Session.get("User");
}
});
Template.layout.events({
  "click #logout" : function(){
    new Fingerprint2().get((result, components) => {
      Meteor.call("delFromRedis", result, (e,r) => {
        if(r){
          Session.set("login", false);
          Session.set("User", null);
          Session.keys = {};
          Session.set("List", true);
          location.reload();
          Router.go("/");
       }
      });
    });
  }
});

Template.layout.onRendered(() => {
  Tracker.autorun(() => {
redisStatus();
  });
});

let redisStatus = () => {
  new Fingerprint2().get((result, components) => {
    Meteor.call("getFormRedis", result, (e,r) => {
      if(r){
        Session.set("login", true);
        Session.set("User", r);
        }
        else
        {
          delete Session.keys['login'];
            delete Session.keys['User'];
        }
    });
  });
}

Template.answer.helpers({
  author: function(){
    var t = this._id;
    Meteor.call("boss",t, Session.get('User'),0,function(error,result){
      if (result)
      {
      Session.set(t+"_A",result);
      }
    });
    return Session.get(t+"_A").author;
  },
    Likes : function(){
      var t = this._id;
    return Session.get(t +"_A").likes;
    },
    Liked : function(){
      id=this._id;
      Meteor.call("liked",id,Session.get('User'),0,function(e,r){
        if(r) Session.set(id+"Liked_A", r);
      });
      return Session.get(id+'Liked_A');
    },
    login : function(){return Session.get("login");},
    PostAuthor : function(){
      var t = this.post;
      Meteor.call("PostAuthor", t, Session.get('User'),function(e,r)
    {
      if(r == true)
      Session.set('PostAuthor', true);
      else Session.set('PostAuthor', false);
    });
      return Session.get('PostAuthor');
    },
    SDate : function(){
  return this.date.toLocaleString('ukr', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });
}
});

Template.answer.events({
  "click #decla" : function(){
    var id = this._id;
    Meteor.call("like", id, Session.get('User'),0,0, function(error, result){
    if(error){
      console.log("error", error);
    }
    if(result){
      Session.set(id+"Liked_A",true);
      Meteor.call("boss",id, Session.get('User'),0,function(error,result2){
        if (result2)
        {
        Session.set(id+"_A",result2);
        }
      });
    }
  });
},
  "click #incla" : function(){
      var id = this._id;
    Meteor.call("like", id, Session.get('User'),1,0, function(error, result){
    if(error){
      console.log("error", error);
    }
    if(result){
        Session.set(id+"Liked_A",true);
      Meteor.call("boss",id, Session.get('User'),0,function(error,result2){
        if (result2)
        {
        Session.set(id+"_A",result2);
        }
      });
    }
  });
},
"click #star" : function(){
  var id = this._id;
  Meteor.call("nf", id);
},
"click .estar" : function(){
  var id = this._id;
  var post = this.post;
  Meteor.call("favorite", id, post);
}
});




Template.answerSubmit.events({
"click #subA": function(e) {
  e.preventDefault();
   var body = $('[name=body]').val();
   if(body != '')
   {
  var post = {
    body: body,
    post:  this._id,
    author : Session.get('User')
  };
  Meteor.call("AnswerInsert", post, function(e,r){
    if(r)
    {
        var t = Session.get(post.post);
      t.answers = t.answers +1;
      Session.set(post.post, t);
      Meteor.call("boss",post.post, Session.get('User'),1,function(error,result2){
        if (result2)
        {
        Session.set(post.post,result2);
        }
      });
    }
  });
$('[name=body]').val('');
}
}});

    Template.postPage.helpers({
  answers : function(){
    return Answers.find({post : this._id},{ sort : {"favorite" : -1, "date" : -1}}).fetch();
  }
});

  Template.postPage.events({
    'click #d' : function(){
      Meteor.call("AnswerRem", {_id : this._id});
    }
  });

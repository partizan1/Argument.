
var subscription;

Posts.sorted = function(limit){
  return Posts.find({},{sort: {"date": -1}, limit : limit});
};

Template.postItem.helpers({
    SDate : function(){
  return this.date.toLocaleString('ukr', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });
},
Liked : function(){
  id=this._id;
  Meteor.call("liked",id,Session.get('User'),1,function(e,r){
    if(r) Session.set(id+"Liked", r);
  });
  return Session.get(id+'Liked');
},
List:function(){ return Session.get('List');},
author : function(){
  var t = this._id;

  if(Session.get(t).author)
  return true;
  return false;
},
Likes : function(){
  var t = this._id;
  Meteor.call("boss",this._id, Session.get('User'),1,function(error,result){
    if (result)
    {
    Session.set(t,result);
    }
  });
return Session.get(t).likes;
},
Answers : function(){
  var t = this._id;
return Session.get(t).answers;
},
login : function(){return Session.get("login");
}

});

Template.postItem.events({
  "click #decl" : function(){
    var id = this._id;
    Meteor.call("like", id, Session.get('User'),0,1, function(error, result){
    if(error){
      console.log("error", error);
    }
    if(result){
      Session.set(id+"Liked",true);
      Meteor.call("boss",id, Session.get('User'),1,function(error,result2){
        if (result2)
        {
        Session.set(id,result2);
        }
      });
    }
  });
},
  "click #incl" : function(){
      var id = this._id;
    Meteor.call("like", id, Session.get('User'),1,1, function(error, result){
    if(error){
      console.log("error", error);
    }
    if(result){
        Session.set(id+"Liked",true);
      Meteor.call("boss",id, Session.get('User'),1,function(error,result2){
        if (result2)
        {
        Session.set(id,result2);
        }
      });
    }
  });
},
"click #delete" : function(){
  Meteor.call("PostRem", this._id);
}
});


Template.postsList.helpers({

  Sub : function(){subscription = Router.current().data();},
  postList: function(){
    return Posts.sorted(subscription.loaded());
  },
  hasMore: function(){
    return Posts.sorted(subscription.loaded()).count() == subscription.limit();
  },
  loading: function() {
  return !subscription.ready();
},

});
Template.postsList.events({
  "click .load-more" : function(event,template){
    event.preventDefault();
    subscription.loadNextPage();
  }
});

Template.MyPosts.helpers({
  postList: function(){
    return Posts.find({author : Session.get('User')});
  }
});
Template.MyPosts.events({
  "click .load-more" : function(event,template){
    event.preventDefault();
    subscription.loadNextPage();}
});

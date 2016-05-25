




Meteor.publish('posts', function(limit) {
return Posts.find({},{author: 0, sort : {"date" : -1}, limit : limit});
});
Meteor.publish('post', (id) => {
return Posts.find({_id : id});
});
Meteor.publish('myposts', function(author) {
return Posts.find({author : author},{author: 0, sort : {"date" : -1}});
})


Meteor.publish('answers', function(id) {
return Answers.find({post : id});
});

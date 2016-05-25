

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});


  Router.route('postsList', {
    onBeforeAction : function(){redisStatus(); this.render("postsList");},
    data: function() {document.title = "Asker: Вопросы"; Session.set("List", true); return Meteor.subscribeWithPagination("posts",4);},
    path: '/'
});

  Router.route('MyPosts', {
    onBeforeAction : function() { redisStatus(); this.next();} ,
    layoutTemplate : function(){
         if (Session.get('login')) return "layout"; return "notFound"},
    data: function() {document.title = "Asker: Мои вопросы"; Session.set("List", true); return Meteor.subscribe("myposts",Session.get('User'));},
    path: '/MyPosts'
});

Router.route('postsAdd', {
  layoutTemplate : function(){
       if (Session.get('login')) return "layout"; return "notFound"},
  onBeforeAction : function(){redisStatus(); this.render("postsAdd"); document.title = "Asker: Добавить вопрос";},
  path: '/add'
});


Router.route('logreg', {
  layoutTemplate : function(){
       if (!Session.get('login')) return "layout"; return "notFound"},
  onBeforeAction : function(){redisStatus(); this.render("logreg"); document.title = "Asker: Вход/Регистрация";},
  path: '/auth'
});

 Router.route('postPage', {
    path: '/posts/:_id',
    onBeforeAction : function(){redisStatus(); this.render("postPage");},
    data: function() {Session.set("List", false);
    Meteor.subscribe('post', this.params._id);
    Meteor.subscribe('answers', this.params._id);
    var t = Posts.findOne(this.params._id);
    document.title = "Asker: " + t.question;
    return t;}
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
  };


Router.onBeforeAction('loading');

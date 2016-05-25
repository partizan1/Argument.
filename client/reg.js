
Template.logreg.events({
  'submit form' : function(e){
    e.preventDefault();
  }
});

Template.logreg.onRendered(function () {


  $('#reg').validate({   rules:{
      rname : {
        required: true
      },
      rpass:{
        required: true,
        minlength: 6
      },
      rrpass :{
        equalTo: "#pass"
      }
    },
    messages:
    {
      rname:{
        rname: "Введите имя"
      },
      rpass:{        required: "Введите пароль", minlength:"Меньше 6 символов"},
      rrpass:{        required: "Не совпадает"}
      },
    submitHandler: function(){
        var user = {
          name: $('[name="rname"]').val(),
          password: $('[name="rpass"]').val()
        };
       Meteor.call("register", user, function(error,result)
     {
       if (error){console.log(error.error);
       }
       if (result)
       {
         new Fingerprint2().get((result, components) => {
           Meteor.call("putInRedis", result, user.name, (e,r) => {
             if(r){
             Session.set("login", true);
             Session.set("User", user.name);
             $('[name="rname"]').val('');
             $('[name="rpass"]').val('');
             $('[name="rrpass"]').val('');
              Router.go("postsList");
            }
           });
         });

       }
     });
    }
  });
  $('#log').validate({   rules:{
      lname : {
        required: true
      },
      lpass:{
        required: true
      }
    },
    messages:
    {
      lname:{
        lname: "Введите имя"
      },
      lpass:{ required: "Введите пароль"}
      },
    submitHandler: function(){
        var user = {
          name: $('[name="lname"]').val(),
          password: $('[name="lpass"]').val()
        };
       Meteor.call("login", user, function(error,result)
     {
       if (error){console.log(error.error);
       }
       if (result)
       {
         if (result == false){ alert("incorrect login"); }
         else{
           new Fingerprint2().get((result, components) => {
             Meteor.call("putInRedis", result, user.name, (e,r) => {
               if(r){
                 Session.keys ={};
               Session.set("login", true);
               Session.set("User", user.name);
               Router.go("postsList");
              }
             });
           });

       }
       }
     });
    }
  });

  });

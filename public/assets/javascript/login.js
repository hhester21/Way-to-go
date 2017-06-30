$(document).ready(function(){
  $("#login-button").click(function(){
    $("#login-modal").modal();
  });

  $("#register-button").click(function(){
    $("#register-modal").modal();
  });

  $("#login-button-submit").click(function(e) {
    $("#login-modal").modal('toggle');
  });

  $("#register-button-submit").click(function(e) {
    $("#register-modal").modal('toggle');
  });

});
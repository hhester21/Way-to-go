$(document).ready(function(){
  $("#login-button").click(function(){
    $("#login-modal").modal();
  });

  $("#register-button").click(function(){
    $("#register-modal").modal();
  });

  $("#login-button-submit").click(function(e) {
    // e.preventDefault();
    $("#login-modal").modal('toggle');
  });

  $("#register-button-submit").click(function(e) {
    e.preventDefault();
    $("#register-modal").modal('toggle');
  });
});
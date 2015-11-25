$(function(){
  $('.seen').on('click', function(){ 
    $(this).closest('.movie').hide()
  });
});
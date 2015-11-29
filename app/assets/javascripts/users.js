function initialize() {
console.log('initialized')
  $('.avatar').on('click', function(){
    
    $('#uploadAvatar').click();

    $("#uploadAvatar").change(function(){
      readURL(this);
    });

  });

}

function readURL(input) {
      if (input.files && input.files[0]) {
          var reader = new FileReader();

          reader.onload = function (e) {
            var result = $('.avatar').attr('src', e.target.result);
            $('.edit_user').submit();
          }

          reader.readAsDataURL(input.files[0]);
      }
  }







$(document).ready(initialize);
$(document).on('page:load', initialize);
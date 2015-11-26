function initialize() {

  // hides a movie on dashboard when user clicks 'seen'

  $('.seen').on('click', function(){ 
    $(this).closest('.movie').hide()
  });

  // populates modal data with whichever user is clicked

  $('.modal-link').on('click', function(){

    console.log('modal clicked')

    // get clicked on user data 
    var data = $(this).find('.hidden-user-data');
    var image = data.find('#user-image').text();
    var name = data.find('#user-name').text();
    var id = data.find('#user-id').text();
    var wants_to_see = data.find('#user-wants-to-see').text();

    console.log(image)
    console.log(name)
    console.log(id)
    console.log(wants_to_see)

    // populate that data in modal

    var modal = $('#myModal')

    modal.find('#modal-image').find('img').attr('src', image);
    modal.find('#modal-name').text(name);
    modal.find('#receiver').val(id.trim());
    modal.find('#modal-wants-to-see').text(wants_to_see);

    
  });


}


$(document).ready(initialize);
$(document).on('page:load', initialize);
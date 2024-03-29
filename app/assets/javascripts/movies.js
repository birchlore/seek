function initializeMovies() {

  console.log('initializing movies!')
  // hides a movie on dashboard when user clicks 'seen'

  $('.seen').on('click', function(){ 
    $(this).closest('.movie').hide()
    $.ajax({
              url: '/dashboard/matches',
              type: "post",
              async:true,
              success: function() {
                // hourly = data.hourly_rate;
                console.log ("matches updated")
              },
              error: function(){
                console.log ("error with ajax")
              }
          
          });
  });

  // populates modal data with whichever user is clicked and updates analytics

  $('.circle-avatar').on('click', function(){

    console.log('modal clicked')

    // get clicked on user data 
    var data = $(this).closest('.modal-link').find('.hidden-user-data');
    var image = data.find('.user-image').text();
    var name = data.find('.user-name').text().trim();
    var age = data.find('.user-age').text();
    var id = data.find('.user-id').text();
    var wants_to_see = data.find('.user-wants-to-see').text();

    // populate that data in modal

    var modal = $('#myModal')

    modal.find('#modal-image').find('img').attr('src', image);
    modal.find('#modal-name').text(name);
    modal.find('#modal-age').text(age);
    modal.find('#receiver').val(id.trim());
    modal.find('#modal-wants-to-see').text(wants_to_see); 


    $.ajax({
        url: '/analytics/users',
        type: "post",
        async:true,
        dataType: "html",
        success: function() {
          // hourly = data.hourly_rate;
          console.log ("modal opened")
        },
        error: function(){
          console.log ("error with ajax")
        }
    
    });


  });

// Tracks trailer views via youtube iframe clicks

$('body').delegate('.videoWrapper iframe').iframeTracker({
      blurCallback: function increaseYoutubeViews() {
           $.ajax({
              url: '/analytics/trailers',
              type: "post",
              async:true,
              dataType: "html",
              success: function() {
                // hourly = data.hourly_rate;
                console.log ("trailer watched")
              },
              error: function(){
                console.log ("error with ajax")
              }
          
          });
      }
});




// submits data when modal submitted

  $('.modal').on('submit', '#new-message', function(event){
    console.log(event);
    event.preventDefault();

     var id = $('#receiver').val();
     var message = $('#message').val();
     var subject = $('#subject').val();


    $.ajax({
      url: '/messages',
      type: "post",
      async:false,
      dataType: "html",
      data: {
        message: message,
        receiver: id,
        subject: subject
      },
      success: function(data) {
        // hourly = data.hourly_rate;
        console.log ("message sent")
        $('#myModal').hide();
        window.location = "/conversations"
      },
      error: function(data){
        console.log ("nooope messages")
        console.log(data)
      }
  
    });

  });
}


$(document).ready(initializeMovies);

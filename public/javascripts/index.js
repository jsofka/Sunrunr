(function($) {
  "use strict"; // Start of use strict

  $(document).ready(function(){
    // Add scrollspy to <body>
    $('body').scrollspy({target: ".navbar", offset: 50});   
  
    // Add smooth scrolling on all links inside the navbar
    $("#myNavbar a").on('click', function(event) {
      // Make sure this.hash has a value before overriding default behavior
      if (this.hash !== "") {
        // Prevent default anchor click behavior
        event.preventDefault();
  
        // Store hash
        var hash = this.hash;
  
        // Using jQuery's animate() method to add smooth page scroll
        // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 800, function(){
     
          // Add hash (#) to URL when done scrolling (default click behavior)
          window.location.hash = hash;
        });
      }  // End if
    });
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#myNavbar',
    offset: 100
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#myNavbar").offset().top > 100) {
      $("#myNavbar").addClass("navbar-shrink");
    } else {
      $("#myNavbar").removeClass("navbar-shrink");
    }
  };

  $(function () {
    $(document).scroll(function () {
      var $nav = $("#main");
      $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());
    });
  });

  var url = "https://api.darksky.net/forecast/abff58316ae2625ab5bcb9bdda50499d/32.2226,-110.9747";
    
  $.ajax({
    url: url,
    dataType: 'jsonp',
    crossDomain: true,
    success: function(data, status) {
      if(status === 'success') {
        var week = ['SUN', 'MON', 'TUES', 'WED', 'THURS', 'FRI', 'SAT']

        var d = new Date();
        var n = d.getDay();
      
        for(var i = 0; i < 5; i++){
          $('#day' + (i + 1) + ' #day').html(week[(n + i) % 7]);

          switch(data['daily']['data'][i]['icon']){
            case 'rain':
              $('#day' + (i + 1) + ' i').addClass('fas fa-cloud-rain');
              break;
            case 'partly-cloudy-day':
              $('#day' + (i + 1) + ' i').addClass('fas fa-cloud-sun');
              break;
            case 'clear-day':
              $('#day' + (i + 1) + ' i').addClass('fas fa-sun');
              break;
            case 'wind':
              $('#day' + (i + 1) + ' i').addClass('fas fa-wind');
              break;
            case 'sleet':
            case 'snow':
              $('#day' + (i + 1) + ' i').addClass('fas fa-snowflake');
              break;
            case 'fog':
              $('#day' + (i + 1) + ' i').addClass('fas fa-smog');
              break;
            case 'cloudy':
              $('#day' + (i + 1) + ' i').addClass('fas fa-cloud');
              break;
            default:
              $('#day' + (i + 1) + ' i').addClass('fas fa-spinner');
          }

          $('#day' + (i + 1) + ' #tempH').html(Math.round(data['daily']['data'][i]['temperatureHigh']) + '&degF');
          $('#day' + (i + 1) + ' #tempL').html(Math.round(data['daily']['data'][i]['temperatureLow']) + '&degF');
        

          }


      }
    }
  });


})(jQuery); // End of use strict

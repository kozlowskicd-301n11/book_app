
$(document).ready(function() {
  $('.toggleFade').hide();
  $('#toggle-btn').on('click', function () {
    $('.toggleFade').fadeToggle('fast', 'linear');
  });
});
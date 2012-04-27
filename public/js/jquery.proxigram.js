/*
 * jquery.proxigram.js
 * Copyright 2012 Forche LLC
 *
 * Significant portions inspired by jquery.instagram.js
 * https://github.com/potomak/jquery-instagram
 *
 */
 
(function($){
 
  $.fn.proxigram = function(options) {
    var that = this,
          settings = {
            api_endpoint: "http://proxigram.com/api/photos",
            access_token: null, // required
            limit: 30,
            include_raw: "no",
            include_default_styles: true,
            complete: null,
            instagram_id: null
          };

    options && $.extend(settings, options);
        
    function createImageElement(image) {
      return $('<div>').addClass('proxigram-image-wrapper').attr('id', image._id).append(
          $('<div>').addClass('proxigram-image').append(
            $('<a>').attr('href', image.link).append(
              $('<img>').addClass('proxigram-image').attr('src', image.images.thumbnail.url).attr('alt', "image by " + image.source_user.full_name )))).append(
          $('<div>').addClass('proxigram-caption').text(image.caption)).append(
          $('<div>').addClass('proxigram-meta').append (
            $('<span>').addClass('proxigram-like-count').text(image.likes_count + " likes")).append (
            $('<span>').addClass('proxigram-comment-count').text(image.comment_count + " comments")));
    }
    
    function createEmptyElement(message) {
      var display_messages = "No Images Found";
      if (2 == arguments.length) {
        display_messages = arguments[1];
      }
      return $("<div class='proxigram-image-wrapper'><div class='proxigram-image'><!-- no image --></div><div class='proxigram-caption'>"+display_messages+"</div><div class='proxigram-meta'><!--"+message+"--></div></div>");
    }
  
    function finalUrlWithArguments(setting_options) {
      return setting_options.api_endpoint + "?" + 
                  $.param({
                    access_token: setting_options.access_token,
                    limit: setting_options.limit,
                    include_raw: setting_options.include_raw
                  });
    }
    
    $(that).empty();
    
    if (settings.access_token !== null) {
      $.ajax(finalUrlWithArguments(settings), {
        type: "GET",
        dataType: "jsonp",
        cache: false
      }).done(function(data, success_code, jqXHR){
        if (data.data !== null && data.data.images !== null) {
          for (var i=0; i < data.data.images.length; i++) {
            var image = data.data.images[i];
            that.append(createImageElement(image));
          }
        } else {
          that.append(createEmptyElment());
        }
      }).fail(function(jqXHR, error_code, exception){
        that.append(createEmptyElment(error_code + ": " + exception));      
      }).always(function(jqXHR, response_code){
        // no op
      });      
    } else {
      that.append(createEmptyElement("access token null", "Missing access_token param. Check the documentation for more info."));
    }
   }; 
})(jQuery);
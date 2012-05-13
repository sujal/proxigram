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
            $('<span>').addClass('proxigram-like-count').append(
              $("<a>").attr("href", image.link).text(image.likes_count + " likes"))).append (
            $('<span>').addClass('proxigram-comment-count').append(
              $("<a>").attr("href", image.link).text(image.comment_count + " comments"))));
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
    
    function fireCallback(status_code, data) {
      settings.complete != null && typeof settings.complete == 'function' && settings.complete(status_code, data);
    }
    
    $(that).empty();
    
    if (settings.include_default_styles === true) {
      var style_tag = $("<style type='text/css'>.proxigram-image-wrapper{min-height:210px;width:150px;padding:10px;margin:5px;background-color:#eee;font-size:10px;line-height:13px;text-align:left;} .proxigram-image-wrapper img{vertical-align:middle;} .proxigram-comment-count:before {content: ' '} .proxigram-image-wrapper span { display: inline-block; width: 75px; } .proxigram-image-wrapper .proxigram-meta{margin-top: 8px;} .proxigram-image-wrapper .proxigram-comment-count{ text-align: right;} .proxigram-image-wrapper .proxigram-image {min-height:150px;line-height: 150px;} .proxigram-caption{overflow:hidden;margin-top:8px;min-height:30px} </style>");
      $(that).append(style_tag);
    }
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
        fireCallback(success_code, data);
      }).fail(function(jqXHR, error_code, exception){
        that.append(createEmptyElment(error_code + ": " + exception));      
        fireCallback(error_code, null);
      }).always(function(jqXHR, response_code){
        // no op
      });      
    } else {
      that.append(createEmptyElement("access token null", "Missing access_token param. Check the documentation for more info."));
    }
   }; 
})(jQuery);

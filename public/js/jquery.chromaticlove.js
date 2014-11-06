/*
 * jquery.chromaticlove.js
 * Copyright 2014 Forche LLC
 *
 * Significant portions inspired by jquery.instagram.js
 * https://github.com/potomak/jquery-instagram
 *
 */

(function($){

  $.fn.chromaticlove = $.fn.proxigram = function(options) {



    var that = this,
          settings = {
            api_endpoint: location.protocol + "//www.chromaticlove.com/api/photos",
            access_token: null, // required
            limit: 30,
            include_raw: "no",
            include_default_styles: true,
            complete: null,
            instagram_id: null
          };

    options && $.extend(settings, options);

    function createImageElement(image) {

      var final_image_url = null;

      if (image.images.thumbnail) {
        final_image_url = image.images.thumbnail.url;
      } else if (image.images.standard_resolution) {
        final_image_url = image.images.standard_resolution.url;
      }

      if (location.protocol == "https:" && final_image_url.match(/^https:/) === null) {
        final_image_url = final_image_url.replace(/^http:/, "https:");
      }

      return $('<div>').addClass('chromaticlove-image-wrapper').attr('id', image._id).append(
          $('<div>').addClass('chromaticlove-image').append(
            $('<a>').attr('href', image.link).append(
              $('<img>').addClass('chromaticlove-image').attr('src', final_image_url).attr('alt', "image by " + image.source_user.full_name )))).append(
          $('<div>').addClass('chromaticlove-caption').text(image.caption)).append(
          $('<div>').addClass('chromaticlove-meta').append (
            $('<span>').addClass('chromaticlove-like-count').append(
              $("<a>").attr("href", image.link).text(image.likes_count + " likes"))).append (
            $('<span>').addClass('chromaticlove-comment-count').append(
              $("<a>").attr("href", image.link).text(image.comment_count + " comments"))));
    }

    function createEmptyElement(message) {
      var display_messages = "No Images Found";
      if (2 == arguments.length) {
        display_messages = arguments[1];
      }
      return $("<div class='chromaticlove-image-wrapper'><div class='chromaticlove-image'><!-- no image --></div><div class='chromaticlove-caption'>"+display_messages+"</div><div class='chromaticlove-meta'><!--"+message+"--></div></div>");
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
      var style_tag = $("<style type='text/css'>.chromaticlove-image-wrapper{min-height:210px;width:150px;padding:10px;margin:5px;background-color:#eee;font-size:10px;line-height:13px;text-align:left;} .chromaticlove-image-wrapper img{vertical-align:middle;} .chromaticlove-comment-count:before {content: ' '} .chromaticlove-image-wrapper span { display: inline-block; width: 75px; } .chromaticlove-image-wrapper .chromaticlove-meta{margin-top: 8px;} .chromaticlove-image-wrapper .chromaticlove-comment-count{ text-align: right;} .chromaticlove-image-wrapper .chromaticlove-image {min-height:150px;line-height: 150px;} .chromaticlove-caption{overflow:hidden;margin-top:8px;min-height:30px} </style>");
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

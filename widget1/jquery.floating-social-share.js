/*!
 * jQuery Floating Social Share Plugin v1.3.0
 * http://burakozdemir.co.uk
 * Burak Ozdemir - <https://github.com/ozdemirburak>
 * Released under the MIT license
 */

;(function($, window, document, undefined) {

    "use strict";

    var pluginName = "floatingSocialShare",
        defaults = {
            place: "top-left",
            counter: true,
            twitter_counter: false,
            buttons: ["facebook", "twitter", "google-plus"],
            title: document.title,
            url: window.location.href,
            description: $('meta[name="description"]').attr("content") || "",
            media: $('meta[property="og:image"]').attr("content") || "",
            text: "share with ",
            popup_width: 400,
            popup_height: 300
        };

    function Plugin (element, options) {
        this.element = element;
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        init: function() {

            if ($.inArray(this.settings.place, places) == -1) {
                this.settings.place = this._defaults.place;
            }

            var base = this,
                $template = $("<div>", { id: "floatingSocialShare" }),
                $child = $("<div>", { class: this.settings.place }).appendTo($template);

            $.each(this.settings.buttons, function(index, value) {
                $.each(networks, function(k, v) {
                    if (value === k) {
                        var $icon = $("<i>", { class: "margin-top-5 fa fa-" + value }),
                            _href = v.url.replace('{url}', base.settings.url)
                                         .replace('{title}', base.settings.title)
                                         .replace('{description}', base.settings.description)
                                         .replace('{media}', base.settings.media),
                            $component = $("<a>", { title: base.settings.title, class: v.className + " pop-upper"}).attr("href", _href).attr("title", base.settings.text + value).append($icon);
                        if (base.settings.counter === true) {
                            setShareCount(value, encodeURI(base.settings.url), $component, base.settings.twitter_counter);
                        }
                        $child.append($component);
                        return false;
                    }
                });
            });

            $template.appendTo(this.element);

            var popup = $(this.element).find(".pop-upper");

            popup.on("click",function(event) {
                event.preventDefault();
                openPopUp($(this).attr("href"), $(this).attr("title"), base.settings.popup_width, base.settings.popup_height);
            });

            setMobileCss(popup);

            $(window).resize(function() {
                setMobileCss(popup);
            });

        }

    });

    var places = ["content-left", "top-left", "top-right"],
        networks = {
            "envelope":  {
                className: "envelope",
                url: "mailto:user@domain.com?subject={url}"
            },
            "facebook" : {
                className: "facebook",
                url:"https://www.facebook.com/sharer/sharer.php?u={url}&t={title}"
            },
            "google-plus": {
                className: "google-plus",
                url: "https://plus.google.com/share?url={url}"
            },
            "linkedin": {
                className: "linkedin",
                url: "https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}&summary={description}&source="
            },
            "odnoklassniki": {
                className: "odnoklassniki",
                url: "https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl={url}"
            },
            "pinterest":  {
                className: "pinterest",
                url: "https://pinterest.com/pin/create%2Fbutton/?url={url}&description={description}&media={media}"
            },
            "reddit": {
                className: "reddit",
                url: "https://www.reddit.com/submit?url={url}&title={title}"
            },
            "stumbleupon": {
                className: "stumbleupon",
                url: "https://www.stumbleupon.com/submit?url={url}&title={title}"
            },
            "tumblr": {
                className: "tumblr",
                url: "https://www.tumblr.com/share/link?url={url}&name={title}&description={description}"
            },
            "twitter": {
                className: "twitter",
                url:"https://twitter.com/home?status={url}"
            },
            "vk": {
                className: "vk",
                url: "https://vk.com/share.php?url={url}&title={title}&description={description}"
            }
        };

    function openPopUp(url, title, width, height) {
        var w = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width,
            h = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height,
            left = (w / 2) - (width / 2) +  10,
            top  = (h / 2) - (height / 2) +  50;
        window.open(url, title, 'scrollbars=yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left).focus();
    }

    function shorten(num) {
        if (num >= 1000000000)
            return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
        else if (num >= 1000000)
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        else if (num >= 1000)
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        else
            return num;
    }

    function setMobileCss(objects) {
        var w = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
        $.each(objects, function(){
            if(w < 961)
                $(this).css("width", 100 / objects.length + "%");
            else
                $(this).removeAttr("style");
        });
    }

    function appendButtons(count, $component) {
        if(count && count > 0) {
            $component.append($("<span>", { class: "shareCount" }).append(shorten(count))).find("i").removeClass("margin-top-5");
        }
    }

    function setShareCount(network, url, $component, twitter_counter) {
        switch(network) {
            case "facebook":
                $.get('https://graph.facebook.com/'+ url, function(data) {
                    appendButtons(data.shares, $component);
                },'jsonp');
                break;
            case "google-plus":
                $.get('https://share.yandex.ru/gpp.xml?url='+ url +'&callback=?', function(count) {
                    appendButtons(count, $component);
                }, 'jsonp');
                break;
            case "linkedin":
                $.get('https://www.linkedin.com/countserv/count/share?url='+ url +'&callback=?', function(data) {
                    appendButtons(data.count, $component);
                },'jsonp');
                break;
            case "odnoklassniki":
                $.get('https://connect.ok.ru/dk?st.cmd=extLike&ref='+ url +'&callback=?', function() {},'jsonp');
                window.ODKL = window.ODKL || {};
                window.ODKL.updateCount = function(index, count) {
                    appendButtons(count, $component);
                }
                break;
            case "pinterest":
                $.get('https://api.pinterest.com/v1/urls/count.json?url='+ url +'&callback=?', function(data) {
                    appendButtons(data.count, $component);
                },'jsonp');
                break;
            case "reddit":
                $.get('https://www.reddit.com/api/info.json?url='+ url +'&jsonp=?', function(response) {
                    appendButtons(response.data.children[0].data.score, $component);
                },'jsonp');
                break;
            case "tumblr":
                $.get('https://api.tumblr.com/v2/share/stats?url='+ url +'&callback=?', function(data) {
                    appendButtons(data.response.note_count, $component);
                },'jsonp');
                break;
            case "twitter":
                if (twitter_counter == true) {
                    $.get('https://opensharecount.com/count.json?url='+ url +'&callback=?', function(data) {
                        appendButtons(data.count, $component);
                    },'jsonp');
                }
                break;
            case "vk":
                $.get('https://vk.com/share.php?act=count&index=1&url='+ url +'&callback=?', function() {},'jsonp');
                window.VK = window.VK || {};
                window.VK.Share = window.VK.Share || {};
                window.VK.Share.count = function(index, count) {
                    appendButtons(count, $component);
                }
                break;
            default:
                return -1;
        }
    }

    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName))
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        });
    };

})(jQuery, window, document);

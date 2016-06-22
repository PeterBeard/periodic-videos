function load_elements() {
    VIDEOS_FILE = 'videos.json';
    var ELEMENTS_FILE = 'elements.json';
    var videos = [];
    var elements = [];
    $.getJSON(VIDEOS_FILE, function(data) {
        videos = data;
    }).then(function() {
        $.getJSON(ELEMENTS_FILE, function(data) {
            elements = data;
        }).then(function() {
            $.each(elements, function(k, v) {
                var cell = $('#' + v.symbol.toLowerCase());
                cell.mouseover(function() {
                    show_element_details(k, v);
                });
                cell.click(function() {
                    open_video(videos[k]);
                });
            });
        }).done(function() {
            update_elements(elements);
        });
    });
}

function update_elements(elements) {
    $.each(elements, function(k, v) {
        console.log(v);
        var cell = $('#' + v.symbol.toLowerCase());
        cell.empty();
        cell.append($('<span class="atomic-number">' + v.number + '</span>'));
        cell.append($('<span class="symbol">' + v.symbol + '</span>'));
        cell.append($('<span class="mass">' + Math.round(v.atomic_mass*100)/100 + '</span>'));
        if(v.category) {
            cell.addClass(v.category.replace(/ /g, '-'));
        }
    });
}

function titleCase(string) {
    var words = string.split(' ');
    for(var w in words) {
        words[w] = words[w].substr(0,1).toUpperCase() + words[w].substr(1);
    }
    return words.join(' ');
}

function format_discovery(year, by) {
    if(!year || !by) {
        return null;
    }

    var rstr = 'Discovered ';
    if(year.search(/^\d/) == 0) {
        rstr += ' in ' + year
    } else {
        rstr += year;
    }

    rstr += ' by ';
    if(by.length == 1) {
        rstr += by[0];
    } else {
        for(var i = 0; i < by.length - 1; i++) {
            rstr += by[i];
            if(i < by.length - 2) {
                rstr += ', ';
            }
        }
        rstr += ', and ' + by[by.length - 1];
    }
    return rstr;
}

function show_element_details(name, details) {
    var d_elem = $('#details');
    d_elem.empty();
    var title = $('<h1></h1>').appendTo(d_elem);
    title.append(details.number + ' // ' + name + ' // ' + details.symbol);

    var period = $('<p></p>').appendTo(d_elem);
    period.append('Period ' + details.period + ', group ' + details.group);
    if(details.trivial_group) {
        period.append(' (' + details.trivial_group + ')');
    }
    if(details.discovered_year && details.discovered_by) {
        period.after('<p class="discovery">' + format_discovery(details.discovered_year, details.discovered_by) + '</p>');
    }

    var properties = $('<ul></ul>').appendTo(d_elem);
    properties.append('<li>' + titleCase(details.category) + '</li>');


    properties.append('<li>Atomic weight: <em>' + details.atomic_mass + '</em></li>');
    if(details.melt) {
        properties.append('<li>Melting point: <em>' + details.melt + ' K</em></li>');
    }
    if(details.boil) {
        properties.append('<li>Boiling point: <em>' + details.boil + ' K</em></li>');
    }
    if(details.density) {
        properties.append('<li>Density: <em>' + details.density + ' g/cm<sup>3</sup></em></li>');
    }
}

function open_video(video_id) {
    if(!video_id) {
        return;
    }

    player = new YT.Player('player', {
        height: '720',
        width: '1280',
        videoId: video_id,
        events: {
            'onReady': function(event) {
                event.target.playVideo();
                $('#player-modal-bg').fadeIn(300);
                $('#player-modal').fadeIn(400);
            },
            'onStateChange': function(event) {
                if(event.data == YT.PlayerState.ENDED) {
                    close_video();
                }
            }
        }
    });
}

function close_video() {
    $('#player-modal').fadeOut(400, function() {
        $('#player-modal').html('<div id="player"></div>');
    });
    $('#player-modal-bg').fadeOut(500);
}

$(document).ready(function() {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var player;
    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: '',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }


    load_elements();
    
    $('#player-modal-bg').click(function() {
        close_video();
    });
    $('body').keypress(function(e) {
        // Close video on escape
        if(e.keyCode == 27) {
            close_video();
        }
    });
});

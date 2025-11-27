(function() {
    'use strict';

    // --- НАЛАШТУВАННЯ ---
    var CONFIG = {
        cacheTime: 3 * 24 * 60 * 60 * 1000, // 3 дні
        omdbCacheKey: 'maxsm_rating_omdb',
        idCacheKey: 'maxsm_rating_id_mapping',
        apiKey: window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEY ? window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEY : '12c9249c',
        weights: {
            imdb: 0.40,
            tmdb: 0.40,
            mc: 0.10,
            rt: 0.10
        }
    };

    var AGE_RATINGS = {
        'G': '3+', 'PG': '6+', 'PG-13': '13+', 'R': '17+', 'NC-17': '18+',
        'TV-Y': '0+', 'TV-Y7': '7+', 'TV-G': '3+', 'TV-PG': '6+', 'TV-14': '14+', 'TV-MA': '17+'
    };

    // --- МОВНІ КОНСТАНТИ ТА ІКОНКИ ---
    Lampa.Lang.add({
        ratimg_omdb_avg: {
            ru: 'ИТОГ', en: 'TOTAL', uk: '<svg width="14px" height="14px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" class="iconify iconify--twemoji"><path fill="#FFAC33" d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"></path></svg>', be: 'ВЫНІК', pt: 'TOTAL', zh: '总评', he: 'סה"כ', cs: 'VÝSLEDEK', bg: 'РЕЗУЛТАТ'
        },
        loading_dots: {
            ru: 'Загрузка...', en: 'Loading...', uk: '...', be: 'Загрузка...', pt: '...', zh: '...', he: '...', cs: '...', bg: '...'
        },
        maxsm_omdb_oscars: {
            ru: 'Оскары', en: 'Oscars', uk: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height:14px; width:auto; display:inline-block; vertical-align:middle; fill:#ffcc00;"><path d="M117.3 64.9c-2.8 9.3-5.3 19.3-7.5 29.9c-2.3 10.9-4.1 22.4-5.5 34.2c-2.7 23.3-3.4 47.9-1.9 72.3c2.9 46.5 15.6 92.4 36.8 133.4c2.8-4.5 5.8-9 8.9-13.3c7.2-10.1 14.8-19.8 22.8-29.1c-14.4-38.3-22.3-80.3-22.3-124.3c0-11.4 .5-22.7 1.5-33.8c-10.8 7.3-21.8 13.7-32.8 19.3zm195.4 0c-11-5.6-22-12-32.8-19.3c1 11.2 1.5 22.5 1.5 33.8c0 44-7.9 86-22.3 124.3c8 9.3 15.6 19 22.8 29.1c3.1 4.3 6.1 8.8 8.9 13.3c21.2-41 33.9-86.9 36.8-133.4c1.5-24.3 .9-49-1.9-72.3c-1.4-11.8-3.2-23.3-5.5-34.2c-2.2-10.6-4.7-20.6-7.5-29.9zM203.3 352c-4.8 12.3-15.8 21.8-29.1 24.3s-26.6-2.5-35.3-12.8c-28.7-34-51.5-72.2-67.4-113.1c-1.3 22.6-1.5 45.4-.5 68.1c2 42.2 12 83.1 29 121.2l0 0c11.5 25.8 17.5 53.7 17.5 82l0 12.8c0 17.7 14.3 32 32 32l113 0c17.7 0 32-14.3 32-32l0-12.8c0-28.3 6-56.2 17.5-82l0 0c17.1-38.1 27-79 29-121.2c1.1-22.7 .8-45.5-.5-68.1c-15.9 40.9-38.7 79.1-67.4 113.1c-8.7 10.3-22 15.3-35.3 12.8s-24.3-12-29.1-24.3c-9.1-23.3-18.9-46.1-29.4-68.3c-10.5 22.2-20.3 44.9-29.4 68.3zM280.3 19.4c-6.8-7.9-19-8.4-26.4-1.1c-22.3 21.9-45.8 42.6-70.3 61.9c18.5 2.1 36.6 6.8 53.9 13.7l20 8 20-8c17.3-6.9 35.4-11.6 53.9-13.7c-24.6-19.3-48-40-70.3-61.9c-.2-.2-.5-.4-.7-.6z"/></svg>', be: 'Оскары', pt: 'Oscars', zh: '奥斯卡奖', he: 'אוסקר', cs: 'Oscary', bg: 'Оскари'
        },
        source_imdb: {
            ru: 'IMDB', en: 'IMDB', uk: '<svg viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg" style="height:15px; width:auto; display:inline-block; vertical-align:middle;"><rect width="48" height="24" rx="3" fill="#F5C518"/><path d="M9.8 17h-2.1v-9.6h2.1v9.6zm4.3 0h-2.1v-9.6h2.1v1.5c.5-.8 1.1-1.6 2.4-1.6 1.2 0 2.2.8 2.3 2.1.2-1.3 1.1-2.1 2.3-2.1 1.4 0 2.3.9 2.3 3v6.7h-2.1v-6c0-.9-.3-1.3-1-1.3-.7 0-1.1.4-1.2 1.3v6h-2.1v-6.2c0-.8-.3-1.3-1-1.3-.6 0-1 .4-1.2 1.3v6.2zm11.7 0h-2.8v-9.6h2.4v.7c.6-.8 1.4-1 2.4-1 1.7 0 2.9 1.4 2.9 4.9s-1.2 5-2.9 5c-1 0-1.9-.3-2.4-1l.4 1zm2.3-1.7c.9 0 1.2-.8 1.2-3.2 0-2.4-.3-3.2-1.2-3.2-.8 0-1.2.9-1.2 3.2 0 2.4.4 3.2 1.2 3.2zm6.7 1.7h-2.1v-9.6h2.1v3.2c.4-.6 1-1 1.8-1 1.3 0 2 .9 2 2.6v4.8h-2.1v-4.3c0-.9-.2-1.3-.9-1.3-.7 0-1 .4-1.2 1.3v4.3z" fill="#000"/></svg>', be: 'IMDB', pt: 'IMDB', zh: 'IMDB', he: 'IMDB', cs: 'IMDB', bg: 'IMDB'
        },
        source_tmdb: {
            ru: 'TMDB', en: 'TMDB', uk: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 185.04 133.4" style="height:14px; width:auto; display:inline-block; vertical-align:middle;"><defs><linearGradient id="tmdb_grad" y1="66.7" x2="185.04" y2="66.7" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#90cea1"/><stop offset="0.56" stop-color="#3cbec9"/><stop offset="1" stop-color="#00b3e5"/></linearGradient></defs><path fill="url(#tmdb_grad)" d="M51.06,66.7h0A17.67,17.67,0,0,1,68.73,49h-.1A17.67,17.67,0,0,1,86.3,66.7h0A17.67,17.67,0,0,1,68.63,84.37h.1A17.67,17.67,0,0,1,51.06,66.7Zm82.67-31.33h32.9A17.67,17.67,0,0,0,184.3,17.7h0A17.67,17.67,0,0,0,166.63,0h-32.9A17.67,17.67,0,0,0,116.06,17.7h0A17.67,17.67,0,0,0,133.73,35.37Zm-113,98h63.9A17.67,17.67,0,0,0,102.3,115.7h0A17.67,17.67,0,0,0,84.63,98H20.73A17.67,17.67,0,0,0,3.06,115.7h0A17.67,17.67,0,0,0,20.73,133.37Zm83.92-49h6.25L125.5,49h-8.35l-8.9,23.2h-.1L99.4,49H90.5Zm32.45,0h7.8V49h-7.8Zm22.2,0h24.95V77.2H167.1V70h15.35V62.8H167.1V56.2h16.25V49h-24ZM10.1,35.4h7.8V6.9H28V0H0V6.9H10.1ZM39,35.4h7.8V20.1H61.9V35.4h7.8V0H61.9V13.2H46.75V0H39Zm41.25,0h25V28.2H88V21h15.35V13.8H88V7.2h16.25V0h-24Zm-79,49H9V57.25h.1l9,27.15H24l9.3-27.15h.1V84.4h7.8V49H29.45l-8.2,23.1h-.1L13,49H1.2Zm112.09,49H126a24.59,24.59,0,0,0,7.56-1.15,19.52,19.52,0,0,0,6.35-3.37,16.37,16.37,0,0,0,4.37-5.5A16.91,16.91,0,0,0,146,115.8a18.5,18.5,0,0,0-1.68-8.25,15.1,15.1,0,0,0-4.52-5.53A18.55,18.55,0,0,0,133.07,99,33.54,33.54,0,0,0,125,98H113.29Zm7.81-28.2h4.6a17.43,17.43,0,0,1,4.67.62,11.68,11.68,0,0,1,3.88,1.88,9,9,0,0,1,2.62,3.18,9.87,9.87,0,0,1,1,4.52,11.92,11.92,0,0,1-1,5.08,8.69,8.69,0,0,1-2.67,3.34,10.87,10.87,0,0,1-4,1.83,21.57,21.57,0,0,1-5,.55H121.1Zm36.14,28.2h14.5a23.11,23.11,0,0,0,4.73-.5,13.38,13.38,0,0,0,4.27-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68,9.16,9.16,0,0,0-.55-3.2,7.79,7.79,0,0,0-1.57-2.62,8.38,8.38,0,0,0-2.45-1.85,10,10,0,0,0-3.18-1v-.1a9.28,9.28,0,0,0,4.43-2.82,7.42,7.42,0,0,0,1.67-5,8.34,8.34,0,0,0-1.15-4.65,7.88,7.88,0,0,0-3-2.73,12.9,12.9,0,0,0-4.17-1.3,34.42,34.42,0,0,0-4.63-.32h-13.2Zm7.8-28.8h5.3a10.79,10.79,0,0,1,1.85.17,5.77,5.77,0,0,1,1.7.58,3.33,3.33,0,0,1,1.23,1.13,3.22,3.22,0,0,1,.47,1.82,3.63,3.63,0,0,1-.42,1.8,3.34,3.34,0,0,1-1.13,1.2,4.78,4.78,0,0,1-1.57.65,8.16,8.16,0,0,1-1.78.2H165Zm0,14.15h5.9a15.12,15.12,0,0,1,2.05.15,7.83,7.83,0,0,1,2,.55,4,4,0,0,1,1.58,1.17,3.13,3.13,0,0,1,.62,2,3.71,3.71,0,0,1-.47,1.95,4,4,0,0,1-1.23,1.3,4.78,4.78,0,0,1-1.67.7,8.91,8.91,0,0,1-1.83.2h-7Z"/></svg>', be: 'TMDB', pt: 'TMDB', zh: 'TMDB', he: 'TMDB', cs: 'TMDB', bg: 'TMDB'
        },
        source_rt: {
            ru: 'Rotten Tomatoes', en: 'Rotten Tomatoes', uk: '<svg viewBox="0 0 138.75 141.25" xmlns="http://www.w3.org/2000/svg" style="height:14px; width:auto; display:inline-block; vertical-align:middle;"><path d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z" fill="#f93208"/><path d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z" fill="#f93208"/><path d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/></svg>', be: 'Rotten Tomatoes', pt: 'Rotten Tomatoes', zh: '烂番茄', he: 'Rotten Tomatoes', cs: 'Rotten Tomatoes', bg: 'Rotten Tomatoes'
        },
        source_mc: {
            ru: 'Metacritic', en: 'Metacritic', uk: '<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88" style="height:14px; width:auto; display:inline-block; vertical-align:middle;"><circle fill="#001B36" stroke="#FC0" stroke-width="4.6" cx="44" cy="44" r="41.6"/><path fill="#FFF" d="m27.5 53.5l5 0 0-11.8c0-2-0.2-3.4-0.6-4-0.5-0.8-1.3-1.2-2.3-1.2-0.8 0-1.5 0.2-2.2 0.7-0.7 0.5-1.2 1.2-1.5 2.1-0.3 0.9-0.4 2.3-0.4 4.3l0 10 5.5 0 0 13.3-5.5 0 0-12c0-2.1-0.2-3.4-0.6-4-0.5-0.8-1.3-1.2-2.3-1.2-0.8 0-1.5 0.2-2.2 0.7-0.7 0.5-1.2 1.2-1.5 2.1-0.3 0.9-0.4 2.3-0.4 4.3l0 10-5.5 0 0-21.7 5.1 0 0 2.8c1.8-2.2 4-3.3 6.5-3.3 1.3 0 2.5 0.3 3.5 0.8 1 0.5 1.8 1.4 2.4 2.5 0.9-1.1 1.9-1.9 2.9-2.5 1.1-0.5 2.2-0.8 3.4-0.8 1.5 0 2.8 0.3 3.9 0.9 1.1 0.6 1.8 1.5 2.4 2.7 0.4 0.9 0.6 2.3 0.6 4.3l0 13.3z" transform="translate(10, 10)"/></svg>', be: 'Metacritic', pt: 'Metacritic', zh: 'Metacritic', he: 'Metacritic', cs: 'Metacritic', bg: 'Metacritic'
        }
    });

    // --- СТИЛІ ---
    var css = 
        ".full-start-new__rate-line { flex-wrap: wrap; gap: 0.4em 0; position: relative; }" +
        ".full-start-new__rate-line > * { margin-left: 0 !important; margin-right: 0.6em !important; }" +
        ".rate--avg.rating--green { color: #4caf50; }" +
        ".rate--avg.rating--lime { color: #3399ff; }" +
        ".rate--avg.rating--orange { color: #ff9933; }" +
        ".rate--avg.rating--red { color: #f44336; }" +
        ".rate--oscars { color: gold; }" +
        ".loading-dots-container { display: inline-flex; align-items: center; order: 5; }" + 
        ".loading-dots { display: inline-flex; align-items: center; gap: 0.4em; color: #ffffff; font-size: 1em; background: rgba(0, 0, 0, 0.3); padding: 0.6em 1em; border-radius: 0.5em; }" +
        ".loading-dots__text { margin-right: 0; }";
    
    Lampa.Template.add('rating_plugin_css', '<style>' + css + '</style>');
    $('body').append(Lampa.Template.get('rating_plugin_css', {}, true));

    // --- ДОПОМІЖНІ ФУНКЦІЇ ---
    function parseOscars(text) {
        if (typeof text !== 'string') return null;
        var match = text.match(/Won (\d+) Oscars?/i);
        return match ? parseInt(match[1], 10) : null;
    }

    function getCardType(card) {
        return (card.media_type === 'movie' || card.type === 'movie') ? 'movie' : 'tv';
    }

    // Робота з кешем
    function getCache(name, key) {
        var cache = Lampa.Storage.get(name) || {};
        var item = cache[key];
        return item && (Date.now() - item.timestamp < CONFIG.cacheTime) ? item : null;
    }

    function setCache(name, key, value) {
        var cache = Lampa.Storage.get(name) || {};
        value.timestamp = Date.now();
        cache[key] = value;
        Lampa.Storage.set(name, cache);
    }

    // --- ОСНОВНА ЛОГІКА ---
    function fetchAdditionalRatings(card, retryCount) {
        var activityInstance = Lampa.Activity.active();
        if (!activityInstance || !activityInstance.activity) return;

        var activity = activityInstance.activity;
        var render = activity.render();

        // Швидший Retry (кожні 100мс замість 1000мс)
        if (!render || !render.length || !render.find('.full-start-new__rate-line').length) {
            if (!retryCount || retryCount < 10) {
                setTimeout(function() { fetchAdditionalRatings(card, (retryCount || 0) + 1); }, 100);
            }
            return;
        }

        var rateLine = render.find('.full-start-new__rate-line');

        // Перевірка на дублювання
        if (rateLine.find('.rate--rt, .rate--mc, .loading-dots-container').length) return;

        // Лоадер: Вставляємо після IMDB або TMDB, щоб порядок був правильний під час завантаження
        var loader = $('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">' + Lampa.Lang.translate("loading_dots") + '</span></div></div>');
        insertAfterRating(rateLine, loader);

        var normCard = {
            id: card.id,
            imdb_id: card.imdb_id || card.imdb || null,
            type: getCardType(card),
            vote_average: card.vote_average || 0
        };

        var cacheKey = normCard.type + '_' + (normCard.imdb_id || normCard.id);
        var cached = getCache(CONFIG.omdbCacheKey, cacheKey);

        var onComplete = function(data) {
            loader.remove();
            if (!$.contains(document.documentElement, rateLine[0])) return;
            updateUI(render, rateLine, data || {}, normCard);
        };

        if (cached) {
            onComplete(cached);
        } else {
            getImdbId(normCard, function(imdbId) {
                if (!imdbId) {
                    onComplete({});
                    return;
                }
                
                normCard.imdb_id = imdbId;
                var finalKey = normCard.type + '_' + imdbId;
                
                cached = getCache(CONFIG.omdbCacheKey, finalKey);
                if (cached) {
                    onComplete(cached);
                    return;
                }

                var url = 'https://www.omdbapi.com/?apikey=' + CONFIG.apiKey + '&i=' + imdbId;
                
                new Lampa.Reguest().silent(url, function(res) {
                    if (res && res.Response === 'True') {
                        var data = {
                            rt: extractRating(res.Ratings, 'Rotten Tomatoes'),
                            mc: extractRating(res.Ratings, 'Metacritic'),
                            imdb: res.imdbRating || null,
                            ageRating: res.Rated || null,
                            oscars: parseOscars(res.Awards)
                        };
                        setCache(CONFIG.omdbCacheKey, finalKey, data);
                        onComplete(data);
                    } else {
                        onComplete({});
                    }
                }, function() { onComplete({}); });
            });
        }
    }

    function getImdbId(card, callback) {
        if (card.imdb_id) return callback(card.imdb_id);

        var cacheKey = card.type + '_' + card.id;
        var cached = getCache(CONFIG.idCacheKey, cacheKey);
        if (cached) return callback(cached.imdb_id);

        var url = 'https://api.themoviedb.org/3/' + card.type + '/' + card.id + '/external_ids?api_key=' + Lampa.TMDB.key();
        
        new Lampa.Reguest().silent(url, function(data) {
            if (data && data.imdb_id) {
                setCache(CONFIG.idCacheKey, cacheKey, { imdb_id: data.imdb_id });
                callback(data.imdb_id);
            } else {
                callback(null);
            }
        }, function() { callback(null); });
    }

    function extractRating(ratings, source) {
        if (!ratings) return null;
        var item = ratings.find(function(r) { return r.Source === source; });
        if (!item) return null;
        return source === 'Rotten Tomatoes' 
            ? parseFloat(item.Value.replace('%', '')) / 10 
            : parseFloat(item.Value.split('/')[0]) / 10;
    }

    function insertAfterRating(rateLine, element) {
    var lastRating = rateLine.find('.rate--imdb, .rate--tmdb').last();

    function domInsertAfter(refNode, nodeToInsert) {
        var parent = refNode.parentNode;
        parent.insertBefore(nodeToInsert, refNode.nextSibling);
    }

    if (lastRating.length) {
        var refDom = lastRating[0];
        if (element instanceof DocumentFragment || element.nodeType === 11) {
            domInsertAfter(refDom, element);
        } else if (element.jquery) {
            Array.prototype.slice.call(element.get()).forEach(function(node) {
                domInsertAfter(refDom, node);
                refDom = node;
            });
        } else if (element.nodeType) {
            domInsertAfter(refDom, element);
        } else {
            lastRating.after(element);
        }
        return;
    }

    var oscars = rateLine.find('.rate--oscars');
    if (oscars.length) {
        var refDom = oscars.last()[0];
        if (element instanceof DocumentFragment || element.nodeType === 11) {
            domInsertAfter(refDom, element);
        } else if (element.jquery) {
            Array.prototype.slice.call(element.get()).forEach(function(node) {
                domInsertAfter(refDom, node);
                refDom = node;
            });
        } else if (element.nodeType) {
            domInsertAfter(refDom, element);
        } else {
            oscars.after(element);
        }
        return;
    }

    var firstBadge = rateLine.children().not('.full-start__rate').first();
    if (firstBadge.length) {
        var refDom = firstBadge[0];
        if (element instanceof DocumentFragment || element.nodeType === 11) {
            refDom.parentNode.insertBefore(element, refDom);
        } else if (element.jquery) {
            Array.prototype.slice.call(element.get()).forEach(function(node) {
                refDom.parentNode.insertBefore(node, refDom);
            });
        } else if (element.nodeType) {
            refDom.parentNode.insertBefore(element, refDom);
        } else {
            firstBadge.before(element);
        }
    } else {
        if (element instanceof DocumentFragment || element.nodeType === 11) {
            rateLine[0].appendChild(element);
        } else {
            rateLine.append(element);
        }
    }
}


    function updateUI(render, rateLine, data, card) {
        var fragment = document.createDocumentFragment();

        // Створюємо елементи
        if (data.rt) fragment.appendChild(createRateItem(data.rt.toFixed(1), 'source_rt', 'rate--rt'));
        if (data.mc) fragment.appendChild(createRateItem(data.mc.toFixed(1), 'source_mc', 'rate--mc'));

        // Вставляємо RT і MC одразу після IMDB/TMDB
        insertAfterRating(rateLine, fragment);

        // Оскари завжди на початку
        if (data.oscars) {
            var oscarsEl = createRateItem(data.oscars, 'maxsm_omdb_oscars', 'rate--oscars');
            rateLine.prepend(oscarsEl);
        }

        // Оновлюємо віковий рейтинг
        if (data.ageRating && data.ageRating !== 'N/A' && data.ageRating !== 'Not Rated') {
            var pg = render.find('.full-start__pg.hide');
            if (pg.length) pg.removeClass('hide').text(AGE_RATINGS[data.ageRating] || data.ageRating);
        }

        // Оновлюємо IMDB
        var imdbRate = render.find('.rate--imdb');
        if (imdbRate.length) {
            imdbRate.removeClass('hide');
            if (data.imdb && !isNaN(data.imdb)) imdbRate.children().eq(0).text(parseFloat(data.imdb).toFixed(1));
            // Оновлюємо іконку на векторну
            imdbRate.children().eq(1).html(Lampa.Lang.translate('source_imdb'));
        }

        render.find('.rate--tmdb > div:nth-child(2)').html(Lampa.Lang.translate('source_tmdb'));

        calcAverage(rateLine, card, data);
    }

    function createRateItem(value, labelKey, className) {
        var div = document.createElement('div');
        div.className = 'full-start__rate ' + className;
        div.innerHTML = '<div>' + value + '</div><div class="source--name">' + Lampa.Lang.translate(labelKey) + '</div>';
        return div;
    }

    function calcAverage(rateLine, card, omdbData) {
        var vals = {
            imdb: parseFloat(omdbData.imdb || rateLine.find('.rate--imdb div:first').text()) || 0,
            tmdb: parseFloat(card.vote_average || rateLine.find('.rate--tmdb div:first').text()) || 0,
            mc: parseFloat(omdbData.mc || rateLine.find('.rate--mc div:first').text()) || 0,
            rt: parseFloat(omdbData.rt || rateLine.find('.rate--rt div:first').text()) || 0
        };

        var sum = 0, weight = 0, count = 0;
        for (var k in vals) {
            if (vals[k] > 0) {
                sum += vals[k] * CONFIG.weights[k];
                weight += CONFIG.weights[k];
                count++;
            }
        }

        rateLine.find('.rate--avg').remove();

        if (count > 1 && weight > 0) {
            var avg = sum / weight;
            var color = avg >= 8 ? 'green' : avg >= 6 ? 'lime' : avg >= 5.5 ? 'orange' : 'red';
            var elem = $('<div class="full-start__rate rate--avg rating--' + color + '"><div>' + avg.toFixed(1) + '</div><div class="source--name">' + Lampa.Lang.translate("ratimg_omdb_avg") + '</div></div>');
            rateLine.prepend(elem); // Підсумок завжди перший
        }
    }

    // --- ЗАПУСК ---
    if (!window.combined_ratings_plugin) {
        window.combined_ratings_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Мінімальна затримка для старту (10мс), щоб дати рендеру ініціалізуватися
                setTimeout(function() {
                    fetchAdditionalRatings(e.data.movie);
                }, 10);
            }
        });
    }
})();
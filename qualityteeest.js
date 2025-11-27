(function() {
    'use strict';

    // --- НАЛАШТУВАННЯ ---
    var CONFIG = {
        cacheTime: 3 * 24 * 60 * 60 * 1000, // 3 дні кешу
        omdbCacheKey: 'maxsm_rating_omdb',
        idCacheKey: 'maxsm_rating_id_mapping',
        // Використовуємо ваш ключ або запасний
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

    // --- МОВНІ КОНСТАНТИ ---
    Lampa.Lang.add({
        ratimg_omdb_avg: {
            ru: 'ИТОГ', en: 'TOTAL', uk: '<svg width="14px" height="14px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" class="iconify iconify--twemoji"><path fill="#FFAC33" d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"></path></svg>', be: 'ВЫНІК', pt: 'TOTAL', zh: '总评', he: 'סה"כ', cs: 'VÝSLEDEK', bg: 'РЕЗУЛТАТ'
        },
        loading_dots: {
            ru: 'Загрузка рейтингов', en: 'Loading ratings', uk: 'Трішки зачекаємо ...', be: 'Загрузка рэйтынгаў', pt: 'Carregando classificações', zh: '加载评分', he: 'טוען דירוגים', cs: 'Načítání hodnocení', bg: 'Зареждане на рейтинги'
        },
        maxsm_omdb_oscars: {
            ru: 'Оскары', en: 'Oscars', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDM4LjE4NTc0NCAxMDEuNzY1IgogICBoZWlnaHQ9IjEzNS42Njk0NSIKICAgd2lkdGg9IjUwLjkwODIwMyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTYiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxNCIgLz4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04LjQwNjE3NDUsMC42OTMpIgogICAgIGlkPSJnNCIKICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmZjYzAwIj4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDYiCiAgICAgICBkPSJtIDI3LjM3MSwtMC42OTMgYyAtMy45MjcsMC4zNjYgLTUuMjI5LDMuNTM4IC00Ljk2Myw2Ljc3OCAwLjI2NiwzLjIzOSAzLjY4NSw2Ljk3MiAwLjEzNSw4Ljk1NiAtMS41NzcsMS40MTMgLTMuMTU0LDMuMDczIC01LjIwNywzLjU0IC0yLjY3OSwwLjYwNyAtNC4yODcsMy4wNTQgLTQuNjA3LDYuNDE5IDEuMzg4LDQuODI0IDAuMzY1LDkuMjg1IDEuNzczLDEyLjgyNCAxLjQwNywzLjUzOSAzLjY5NiwzLjgzMSAzLjk4Niw1LjA3NiAwLjMxNyw3LjYzNyAyLjM0MSwxNy41MzUgMC44NTYsMjQuOTMgMS4xNzIsMC4xODQgMC45MywwLjQ0NCAwLjg5NCwwLjcyOSAtMC4wMzYsMC4yODQgLTAuNDgsMC4zODEgLTEuMDg4LDAuNTI3IDAuODQ3LDcuNjg0IC0wLjI3OCwxMi4xMzYgMS45ODMsMTguNzcxIGwgMCwzLjU5MiAtMS4wNywwIDAsMS41MjQgYyAwLDAgLTcuMzEsLTAuMDA1IC04LjU2NSwwIDAsMCAwLjY4LDIuMTU5IC0xLjUyMywzLjAyNyAwLjAwOCwxLjEgMCwyLjcxOSAwLDIuNzE5IGwgLTEuNTY5LDAgMCwyLjM1MyBjIDEzLjIyMTcwMywwIDI2LjgzNzkwNywwIDM4LjE4NiwwIGwgMCwtMi4zNTIgLTEuNTcsMCBjIDAsMCAtMC4wMDcsLTEuNjE5IDAuMDAxLC0yLjcxOSBDIDQyLjgyLDk1LjEzMyA0My41LDkyLjk3NCA0My41LDkyLjk3NCBjIC0xLjI1NSwtMC4wMDUgLTguNTY0LDAgLTguNTY0LDAgbCAwLC0xLjUyNCAtMS4wNzMsMCAwLC0zLjU5MiBjIDIuMjYxLC02LjYzNSAxLjEzOCwtMTEuMDg3IDEuOTg1LC0xOC43NzEgLTAuNjA4LC0wLjE0NiAtMS4wNTQsLTAuMjQzIC0xLjA5LC0wLjUyNyAtMC4wMzYsLTAuMjg1IC0wLjI3OCwtMC41NDUgMC44OTQsLTAuNzI5IC0wLjg0NSwtOC4wNTggMC45MDIsLTE3LjQ5MyAwLjg1OCwtMjQuOTMgMC4yOSwtMS4yNDUgMi41NzksLTEuNTM3IDMuOTg2LC01LjA3NiAxLjQwOCwtMy41MzkgMC4zODUsLTggMS43NzQsLTEyLjgyNCAtMC4zMiwtMy4zNjUgLTEuOTMxLC01LjgxMiAtNC42MSwtNi40MiAtMi4wNTMsLTAuNDY2IC0zLjQ2OSwtMi42IC01LjM2OSwtMy44ODQgLTMuMTE4LC0yLjQ3MiAtMC42MSwtNS4zNjQgMC4zNzMsLTguNTc4IDAsLTUuMDEgLTIuMTU0LC02LjQ4MyAtNS4yOTMsLTYuODExIHoiCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7b3BhY2l0eToxO2ZpbGw6I2ZmY2MwMCIgLz4KICA8L2c+Cjwvc3ZnPgo=" style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">', be: 'Оскары', pt: 'Oscars', zh: '奥斯卡奖', he: 'אוסקר', cs: 'Oscary', bg: 'Оскари'
        },
        source_imdb: {
            ru: 'IMDB', en: 'IMDB', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCBtZWV0IiB2aWV3Qm94PSIwIDAgNTc1IDI4OS44MyIgd2lkdGg9IjU3NSIgaGVpZ2h0PSIyODkuODMiPjxkZWZzPjxwYXRoIGQ9Ik01NzUgMjQuOTFDNTczLjQ0IDEyLjE1IDU2My45NyAxLjk4IDU1MS45MSAwQzQ5OS4wNSAwIDc2LjE4IDAgMjMuMzIgMEMxMC4xMSAyLjE3IDAgMTQuMTYgMCAyOC42MUMwIDUxLjg0IDAgMjM3LjY0IDAgMjYwLjg2QzAgMjc2Ljg2IDEyLjM3IDI4OS44MyAyNy42NCAyODkuODNDNzkuNjMgMjg5LjgzIDQ5NS42IDI4OS44MyA1NDcuNTkgMjg5LjgzQzU2MS42NSAyODkuODMgNTczLjI2IDI3OC44MiA1NzUgMjY0LjU3QzU3NSAyMTYuNjQgNTc1IDQ4Ljg3IDU3NSAyNC45MVoiIGlkPSJkMXB3aGY5d3kyIj48L3BhdGg+PHBhdGggZD0iTTY5LjM1IDU4LjI0TDExNC45OCA1OC4yNEwxMTQuOTggMjMzLjg5TDY5LjM1IDIzMy44OUw2OS4zNSA1OC4yNFoiIGlkPSJnNWpqbnEyNnlTIj48L3BhdGg+PHBhdGggZD0iTTIwMS4yIDEzOS4xNUMxOTcuMjggMTEyLjM4IDE5NS4xIDk3LjUgMTk0LjY3IDk0LjUzQzE5Mi43NiA4MC4yIDE5MC45NCA2Ny43MyAxODkuMiA1Ny4wOUMxODUuMjUgNTcuMDkgMTY1LjU0IDU3LjA5IDEzMC4wNCA1Ny4wOUwxMzAuMDQgMjMyLjc0TDE3MC4wMSAyMzIuNzRMMjMxLjM5IDExNC4xOEwyMzEuNTQgMjMyLjc0TDI3MS4zOCAyMzIuNzRMMjcxLjM4IDU3LjA5TDIxMS43NyA1Ny4wOUwyMDEuMiAxMzkuMTVaIiBpZD0iaTNQcmgxSnBYdCI+PC9wYXRoPjxwYXRoIGQ9Ik0zNDYuNzEgOTMuNjNDMzQ3LjIxIDk1Ljg3IDM0Ny40NyAxMDAuOTUgMzQ3LjQ3IDEwOC44OUMzNDcuNDcgMTE1LjcgMzQ3LjQ3IDE3MC4xOCAzNDcuNDcgMTc2Ljk5QzM0Ny40NyAxODguNjggMzQ2LjcxIDE5NS44NCAzNDUuMiAxOTguNDhDMzQzLjY4IDIwMS4xMiAzMzkuNjQgMjAyLjQzIDMzMy4wOSAyMDIuNDNDMzMzLjA5IDE5MC45IDMzMy4wOSA5OC42NiAzMzMuMDkgODcuMTNDMzM4LjA2IDg3LjEzIDM0MS40NSA4Ny42NiAzNDMuMjUgODguN0MzNDUuMDUgODkuNzUgMzQ2LjIxIDkxLjM5IDM0Ni43MSA5My42M1pNMzY3LjMyIDIzMC45NUMzNzIuNzUgMjI5Ljc2IDM3Ny4zMSAyMjcuNjYgMzgxLjAxIDIyNC42N0MzODQuNyAyMjEuNjcgMzg3LjI5IDIxNy41MiAzODguNzcgMjEyLjIxQzM5MC4yNiAyMDYuOTEgMzkxLjE0IDE5Ni4zOCAzOTEuMTQgMTgwLjYzQzM5MS4xNCAxNzQuNDcgMzkxLjE0IDEyNS4xMiAzOTEuMTQgMTE4Ljk1QzM5MS4xNCAxMDIuMzMgMzkwLjQ5IDkxLjE5IDM4OS40OCA4NS41M0MzODguNDYgNzkuODYgMzg1LTMgNzQuNzEgMzgxLjg4IDcwLjA5QzM3Ny44MiA2NS40NyAzNzEuOSA2Mi4xNSAzNjQuMTIgNjAuMTNDMzU2LjMzIDU4LjExIDM0My42MyA1Ny4wOSAzMjEuNTQgNTcuMDlDMzE5LjI3IDU3LjA5IDMwNy45MyA1Ny4wOSAyODcuNSA1Ny4wOUwyODcuNSAyMzIuNzRMMzQyLjc4IDIzMi43NEMzNTUuNTIgMjMyLjM0IDM2My43IDIzMS43NSAzNjcuMzIgMjMwLjk1WiIgaWQ9ImE0b3Y5clJHUW0iPjwvcGF0aD48cGF0aCBkPSJNNDY0Ljc2IDIwNC43QzQ2My45MiAyMDYuOTMgNDYwLjI0IDIwOC4wNiA0NTcuNDYgMjA4LjA2QzQ1NC43NCAyMDguMDYgNDUyLjkzIDIwNi45OCA0NTIuMDEgMjA0LjgxQzQ1MS4wOSAyMDIuNjUgNDUwLjY0IDE5Ny43MiA0NTAuNjQgMTkwQzQ1MC42NCAxODUuMzYgNDUwLjY0IDE0OC4yMiA0NTAuNjQgMTQzLjU4QzQ1MC42NCAxMzUuNTggNDUxLjA0IDEzMC41OSA0NTEuODUgMTI4LjZDNDUyLjY1IDEyNi42MyA0NTQuNDEgMTI1LjYzIDQ1Ny4xMyAxMjUuNjNDNDU5LjkxIDEyNS42MyA0NjMuNjQgMTI2Ljc2IDQ2NC42IDEyOS4wM0M0NjUuNTUgMTMxLjMgNDY2LjAzIDEzNi4xNSA0NjYuMDMgMTQzLjU4QzQ2Ni4wMyAxNDYuNTggNDY2LjAzIDE2MS41OCA0NjYuMDMgMTg4LjU5QzQ2NS43NCAxOTcuODQgNDY1LjMyIDIwMy4yMSA0NjQuNzYgMjA0Ljg3QzQ2My45MiAyMDYuOTMgNDYwLjI0IDIwOC4wNiA0NTcuNDYgMjA4LjA2QzQ1NC43NCAyMDguMDYgNDUyLjkzIDIwNi45OCA0NTIuMDEgMjA0LjgxQzQ1MS4wOSAyMDIuNjUgNDUwLjY0IDE5Ny43MiA0NTAuNjQgMTkwQzQ1MC42NCAxODUuMzYgNDUwLjY0IDE0OC4yMiA0NTAuNjQgMTQzLjU4QzQ1MC42NCAxMzUuNTggNDUxLjA0IDEzMC41OSA0NTEuODUgMTI4LjZDNDUyLjY1IDEyNi42MyA0NTQuNDEgMTI1LjYzIDQ1Ny4xMyAxMjUuNjNDNDU5LjkxIDEyNS42MyA0NjMuNjQgMTI2Ljc2IDQ2NC42IDEyOS4wM0M0NjUuNTUgMTMxLjMgNDY2LjAzIDEzNi4xNSA0NjYuMDMgMTQzLjU4QzQ2Ni4wMyAxNDYuNTggNDY2LjAzIDE2MS41OCA0NjYuMDMgMTg4LjU5QzQ2NS43NCAxOTcuODQgNDY1LjMyIDIwMy4yMSA0NjQuNzYgMjA0LjdaTTQwNi42OCAyMzEuMjFMNDQ3Ljc2IDIzMS4yMUM0NDkuNDcgMjI0LjUgNDUwLjQxIDIyMC43NyA0NTAuNiAyMjAuMDJDNDU0LjMyIDIyNC41MiA0NTguNDEgMjI3LjkgNDYyLjkgMjMwLjE0QzQ2Ny4zNyAyMzIuMzkgNDc0LjA2IDIzMy41MSA0NzkuMjQgMjMzLjUxQzQ4Ni40NSAyMzMuNTEgNDkyLjY3IDIzMS42MiA0OTcuOTIgMjI3LjgzQzUwMy4xNiAyMjQuMDUgNTA2LjUgMjE5LjU3IDUwNy45MiAyMTQuNDJDNTA5LjM0IDIwOS4yNiA1MTAuMDUgMjAxLjQyIDUxMC4wNSAxOTAuODhDNTEwLjA1IDE4NS45NSA1MTAuMDUgMTQ2LjUzIDUxMC4wNSAxNDEuNkM1MTAuMDUgMTMxIDUwOS44MSAxMjQuMDggNTA5LjM0IDEyMC44M0M1MDguODcgMTE3LjU4IDUwNy40NyAxMTQuMjcgNTA1LjE0IDExMC44OEM1MDIuODEgMTA3LjQ5IDQ5OS40MiAxMDQuODYgNDk0Ljk4IDEwMi45OEM0OTAuNTQgMTAxLjEgNDg1LjMgMTAwLjE2IDQ3OS4yNiAxMDAuMTZDNDc0LjAxIDEwMC4xNiA0NjcuMjkgMTAxLjIxIDQ2Mi44MSAxMDMuMjhDNDU4LjM0IDEwNS4zNSA0NTQuMjggMTA4LjQ5IDQ1MC42NCAxMTIuN0M0NTAuNjQgMTA4Ljg5IDQ1MC42NCA4OS44NSA0NTAuNjQgNTUuNTZMNDA2LjY4IDU1LjU2TDQwNi42OCAyMzEuMjFaIiBpZD0iZms5NjhCcHNYIj48L3BhdGg+PC9kZWZzPjxnPjxnPjxnPjx1c2UgeGxpbms6aHJlZj0iI2QxcHdoZjl3eTIiIG9wYWNpdHk9IjEiIGZpbGw9IiNmNmM3MDAiIGZpbGwtb3BhY2l0eT0iMSI+PC91c2U+PGc+PHVzZSB4bGluazpocmVmPSIjZzVqam5xMjZ5UyIgb3BhY2l0eT0iMSIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAiPjwvdXNlPjwvZz48L2c+PGc+PHVzZSB4bGluazpocmVmPSIjZzVqam5xMjZ5UyIgb3BhY2l0eT0iMSIgZmlsbD0iIzAwMDAwMCIgZmlsbC1vcGFjaXR5PSIxIj48L3VzZT48Zz48dXNlIHhsaW5rOmhyZWY9IiNnNWpqbnEyNnlTIiBvcGFjaXR5PSIxIiBmaWxsLW9wYWNpdHk9IjAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMCI+PC91c2U+PC9nPjwvZz48Zz48dXNlIHhsaW5rOmhyZWY9IiNpM1ByaDFKcFh0IiBvcGFjaXR5PSIxIiBmaWxsPSIjMDAwMDAwIiBmaWxsLW9wYWNpdHk9IjEiPjwvdXNlPjxnPjx1c2UgeGxpbms6aHJlZj0iI2kzUHJoMUpwWHQiIG9wYWNpdHk9IjEiIGZpbGwtb3BhY2l0eT0iMCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1vcGFjaXR5PSIwIj48L3VzZT48L2c+PC9nPjxnPjx1c2UgeGxpbms6aHJlZj0iI2E0b3Y5clJHUW0iIG9wYWNpdHk9IjEiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMSI+PC91c2U+PGc+PHVzZSB4bGluazpocmVmPSIjYTRvdjlyUkdQbSIgb3BhY2l0eT0iMSIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAiPjwvdXNlPjwvZz48L2c+PGc+PHVzZSB4bGluazpocmVmPSIjZms5NjhCcHNYIiBvcGFjaXR5PSIxIiBmaWxsPSIjMDAwMDAwIiBmaWxsLW9wYWNpdHk9IjEiPjwvdXNlPjxnPjx1c2UgeGxpbms6aHJlZj0iI2ZrOTY4QnBzWCIgb3BhY2l0eT0iMSIgZmlsbC1vcGFjaXR5PSIwIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAiPjwvdXNlPjwvZz48L2c+PC9nPjwvZz48L3N2Zz4=" style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">', be: 'IMDB', pt: 'IMDB', zh: 'IMDB', he: 'IMDB', cs: 'IMDB', bg: 'IMDB'
        },
        source_tmdb: {
            ru: 'TMDB', en: 'TMDB', uk: '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMTg1LjA0IDEzMy40Ij48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6dXJsKCNsaW5lYXItZ3JhZGllbnQpO308L3N0eWxlPjxsaW5lYXJHcmFkaWVudCBpZD0ibGluZWFyLWdyYWRpZW50IiB5MT0iNjYuNyIgeDI9IjE4NS4wNCIgeTI9IjY2LjciIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM5MGNlYTEiLz48c3RvcCBvZmZzZXQ9IjAuNTYiIHN0b3AtY29sb3I9IiMzY2JlYzkiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMGIzZTUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48dGl0bGU+QXNzZXQgNDwvdGl0bGU+PGcgaWQ9IkxheWVyXzIiIGRhdGEtbmFtZT0iTGF5ZXIgMiI+PGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj48cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Ik01MS4wNiw2Ni43aDBBMTcuNjcsMTcuNjcsMCwwLDEsNjguNzMsNDloLS4xQTE3LjY3LDE3LjY3LDAsMCwxLDg2LjMsNjYuN2gwQTE3LjY3LDE3LjY3LDAsMCwxLDY4LjYzLDg0LjM3aC4xQTE3LjY3LDE3LjY3LDAsMCwxLDUxLjA2LDY2LjdabTgyLjY3LTMxLjMzaDMyLjlBMTcuNjcsMTcuNjcsMCwwLDAsMTg0LjMsMTcuN2gwQTE3LjY3LDE3LjY3LDAsMCwwLDE2Ni42MywwaC0zMi45QTE3LjY3LDE3LjY3LDAsMCwwLDExNi4wNiwxNy43aDBBMTcuNjcsMTcuNjcsMCwwLDAsMTMzLjczLDM1LjM3Wm0tMTEzLDk4aDYzLjlBMTcuNjcsMTcuNjcsMCwwLDAsMTAyLjMsMTE1LjdoMEExNy42NywxNy42NywwLDAsMCw4NC42Myw5OEgyMC43M0ExNy42NywxNy42NywwLDAsMCwzLjA2LDExNS43aDBBMTcuNjcsMTcuNjcsMCwwLDAsMjAuNzMsMTMzLjM3Wm04My45Mi00OWg2LjI1TDEyNS41LDQ5aC04LjM1bC04LjksMjMuMmgtLjFMOTkuNCw0OUg5MC41Wm0zMi40NSwwaDcuOFY0OWgtNy44Wm0yMi4yLDBoMjQuOTVWNzcuMkgxNjcuMVY3MGgxNS4zNVY2Mi44SDE2Ny4xVjU2LjJoMTYuMjVWNDloLTI0Wk0xMC4xLDM1LjRoNy44VjYuOUgyOFYwSDBWNi45SDEwLjFaTTM5LDM1LjRoNy44VjIwLjFINjEuOVYzNS40aDcuOFYwSDYxLjlWMTMuMkg0Ni43NVYwSDM5Wm00MS4yNSwwaDI1VjI4LjJIODhWMjFoMTUuMzVWMTMuOEg4OFY3LjJoMTYuMjVWMGgtMjRabS03OSw0OUg5VjU3LjI1aC4xbDksMjcuMTVIMjRsOS4zLTI3LjE1aC4xVjg0LjRoNy44VjQ5SDI5LjQ1bC04LjIsMjMuMWgtLjFMMTMsNDlIMS4yWm0xMTIuMDksNDlIMTI2YTI0LjU5LDI0LjU5LDAsMCwwLDcuNTYtMS4xNSwxOS41MiwxOS41MiwwLDAsMCw2LjM1LTMuMzcsMTYuMzcsMTYuMzcsMCwwLDAsNC4zNy01LjVBMTYuOTEsMTYuOTEsMCwwLDAsMTQ2LDExNS44YTE4LjUsMTguNSwwLDAsMC0xLjY4LTguMjUsMTUuMSwxNS4xLDAsMCwwLTQuNTItNS41M0ExOC41NSwxOC41NSwwLDAsMCwxMzMuMDcsOTksMzMuNTQsMzMuNTQsMCwwLDAsMTI1LDk4SDExMy4yOVptNy44MS0yOC4yaDQuNmExNy40MywxNy40MywwLDAsMSw0LjY3LjYyLDExLjY4LDExLjY4LDAsMCwxLDMuODgsMS44OCw5LDksMCwwLDEsMi42MiwzLjE4LDkuODcsOS44NywwLDAsMSwxLDQuNTIsMTEuOTIsMTEuOTIsMCwwLDEtMSw1LjA4LDguNjksOC42OSwwLDAsMS0yLjY3LDMuMzQsMTAuODcsMTAuODcsMCwwLDEtNCwxLjgzLDIxLjU3LDIxLjU3LDAsMCwxLTUsLjU1SDEyMS4xWm0zNi4xNCwyOC4yaDE0LjVhMjMuMTEsMjMuMTEsMCwwLDAsNC43My0uNSwxMy4zOCwxMy4zOCwwLDAsMCw0LjI3LTEuNjUsOS40Miw5LjQyLDAsMCwwLDMuMS0zLDguNTIsOC41MiwwLDAsMCwxLjItNC42OCw5LjE2LDkuMTYsMCwwLDAtLjU1LTMuMiw3Ljc5LDcuNzksMCwwLDAtMS41Ny0yLjYyLDguMzgsOC4zOCwwLDAsMC0yLjQ1LTEuODUsMTAsMTAsMCwwLDAtMy4xOC0xdi0uMWE5LjI4LDkuMjgsMCwwLDAsNC40My0yLjgyLDcuNDIsNy40MiwwLDAsMCwxLjY3LTUsOC4zNCwwLDAsMC0xLjE1LTQuNjUsNy44OCw3Ljg4LDAsMCwwLTMtMi43MywxMi45LDEyLjksMCwwLDAtNC4xNy0xLjMsMzQuNDIsMzQuNDIsMCwwLDAtNC42My0uMzJoLTEzLjJabTcuOC0yOC44aDUuM2ExMC43OSwxMC43OSwwLDAsMSwxLjg1LjE3LDUuNzcsNS43NywwLDAsMSwxLjcuNTgsMy4zMywzLjMzLDAsMCwxLDEuMjMsMS4xMywzLjIyLDMuMjIsMCwwLDEsLjQ3LDEuODIsMy42MywzLjYzLDAsMCwxLS40MiwxLjgsMy4zNCwzLjM0LDAsMCwxLTEuMTMsMS4yLDQuNzgsNC43OCwwLDAsMS0xLjU3LjY1LDguMTYsOC4xNiwwLDAsMS0xLjc4LjJIMTY1Wm0wLDE0LjE1aDUuOWExNS4xMiwxNS4xMiwwLDAsMSwyLjA1LjE1LDcuODMsNy44MywwLDAsMSwyLC41NSw0LDQsMCwwLDEsMS41OCwxLjE3LDMuMTMsMy4xMywwLDAsMSwuNjIsMiwzLjcxLDMuNzEsMCwwLDEtLjQ3LDEuOTUsNCw0LDAsMCwxLTEuMjMsMS4zLDQuNzgsNC43OCwwLDAsMS0xLjY3LjcsOC45MSw4LjkxLDAsMCwxLTEuODMuMmgtN1oiLz48L2c+PC9nPjwvc3ZnPg==" style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">', be: 'TMDB', pt: 'TMDB', zh: 'TMDB', he: 'TMDB', cs: 'TMDB', bg: 'TMDB'
        },
        source_rt: {
            ru: 'Rotten Tomatoes', en: 'Rotten Tomatoes', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgo8c3ZnIGlkPSJzdmczMzkwIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgaGVpZ2h0PSIxNDEuMjUiIHZpZXdCb3g9IjAgMCAxMzguNzUgMTQxLjI1IiB3aWR0aD0iMTM4Ljc1IiB2ZXJzaW9uPSIxLjEiIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CiA8bWV0YWRhdGEgaWQ9Im1ldGFkYXRhMzM5NiI+CiAgPHJkZjpSREY+CiAgIDxjYzpXb3JrIHJkZjphYm91dD0iIj4KICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgPGRjOnR5cGUgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIvPgogICAgPGRjOnRpdGxlLz4KICAgPC9jYzpXb3JrPgogIDwvcmRmOlJERj4KIDwvbWV0YWRhdGE+CiA8ZyBpZD0ibGF5ZXIxIiBmaWxsPSIjZjkzMjA4Ij4KICA8cGF0aCBpZD0icGF0aDM0MTIiIGQ9Im0yMC4xNTQgNDAuODI5Yy0yOC4xNDkgMjcuNjIyLTEzLjY1NyA2MS4wMTEtNS43MzQgNzEuOTMxIDM1LjI1NCA0MS45NTQgOTIuNzkyIDI1LjMzOSAxMTEuODktNS45MDcxIDQuNzYwOC04LjIwMjcgMjIuNTU0LTUzLjQ2Ny0yMy45NzYtNzguMDA5eiIvPgogIDxwYXRoIGlkPSJwYXRoMzQ3MSIgZD0ibTM5LjYxMyAzOS4yNjUgNC43Nzc4LTguODYwNyAyOC40MDYtNS4wMzg0IDExLjExOSA5LjIwODJ6Ii8+CiA8L2c+CiA8ZyBpZD0ibGF5ZXIyIj4KICA8cGF0aCBpZD0icGF0aDM0MzciIGQ9Im0zOS40MzYgOC41Njk2IDguOTY4Mi01LjI4MjYgNi43NTY5IDE1LjQ3OWMzLjc5MjUtNi4zMjI2IDEzLjc5LTE2LjMxNiAyNC45MzktNC42Njg0LTQuNzI4MSAxLjI2MzYtNy41MTYxIDMuODU1My03LjczOTcgOC40NzY4IDE1LjE0NS00LjE2OTcgMzEuMzQzIDMuMjEyNyAzMy41MzkgOS4wOTExLTEwLjk1MS00LjMxNC0yNy42OTUgMTAuMzc3LTQxLjc3MSAyLjMzNCAwLjAwOSAxNS4wNDUtMTIuNjE3IDE2LjYzNi0xOS45MDIgMTcuMDc2IDIuMDc3LTQuOTk2IDUuNTkxLTkuOTk0IDEuNDc0LTE0Ljk4Ny03LjYxOCA4LjE3MS0xMy44NzQgMTAuNjY4LTMzLjE3IDQuNjY4IDQuODc2LTEuNjc5IDE0Ljg0My0xMS4zOSAyNC40NDgtMTEuNDI1LTYuNzc1LTIuNDY3LTEyLjI5LTIuMDg3LTE3LjgxNC0xLjQ3NSAyLjkxNy0zLjk2MSAxMi4xNDktMTUuMTk3IDI4LjYyNS04LjQ3NnoiIGZpbGw9IiMwMjkwMmUiLz4KIDwvZz4KPC9zdmc+Cg==" style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">', be: 'Rotten Tomatoes', pt: 'Rotten Tomatoes', zh: '烂番茄', he: 'Rotten Tomatoes', cs: 'Rotten Tomatoes', bg: 'Rotten Tomatoes'
        },
        source_mc: {
            ru: 'Metacritic', en: 'Metacritic', uk: '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4OCIgaGVpZ2h0PSI4OCI+CjxjaXJjbGUgZmlsbD0iIzAwMUIzNiIgc3Ryb2tlPSIjRkMwIiBzdHJva2Utd2lkdGg9IjQuNiIgY3g9IjQ0IiBjeT0iNDQiIHI9IjQxLjYiLz4KPHBhdGggdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwLTk2MSkgbWF0cml4KDEuMjc1NjYyOSwtMS4zNDg3NzMzLDEuMzY4NTcxNywxLjI2MzQ5ODcsLTI2Ny4wNDcwNiwxMDY2LjA3NDMpIiBmaWxsPSIjRkZGIgpkPSJtMTI2LjczNDM4LDkyLjA4NzAwMiA1LjA1ODU5LDAgMCwyLjgzMjAzMSBjIDEuODA5ODktMi4yMDA1MDEgMy45NjQ4My0zLjMwMDc2IDYuNDY0ODQtMy4zMDA3ODEgMS4zMjgxMSwyLjFlLTUgMi40ODA0NSwuMjczNDU4IDMuNDU3MDMsLjgyMDMxMiAuOTc2NTUsLjU0Njg5NSAxLjc3NzMzLDEuMzczNzE3IDIuNDAyMzUsMi40ODA0NjkgLjkxMTQ0LTEuMTA2NzUyIDEuODk0NTEtMS45MzM1NzQgMi45NDkyMi0yLjQ4MDQ2OSAxLjA1NDY2LTAuNTQ2ODU0IDIuMTgwOTYtMC44MjAyOTEgMy4zNzg5LTAuODIwMzEyIDEuNTIzNDEsMi4xZS01IDIuODEyNDcsLjMwOTI2NSAzLjg2NzE5LC45Mjc3MzQgMS4wNTQ2NiwuNjE4NTA5IDEuODQyNDIsMS41MjY3MTEgMi4zNjMyOCwyLjcyNDYwOSAuMzc3NTcsLjg4NTQzNCAuNTY2MzcsMi4zMTc3MjQgLjU2NjQxLDQuMjk2ODc1IGwgMCwxMy4yNjE3Mi01LjQ4ODI4LDAgMC0xMS44NTU0NyBjLTNlLTUtMi4wNTcyNzctMC4xODg4My0zLjM4NTQwMS0wLjU2NjQxLTMuOTg0Mzc1LTAuNTA3ODQtMC43ODEyMzMtMS4yODkwOS0xLjE3MTg1OC0yLjM0Mzc1LTEuMTcxODc1LTAuNzY4MjUsMS43ZS01LTEuNDkwOTEsLjIzNDM5Mi0yLjE2Nzk3LC43MDMxMjUtMC42NzcxLC40Njg3NjYtMS4xNjUzOCwxLjExMzI5Ny0xLjQ2NDg0LDIuMDYwNTQ3LTAuMjk5NSwuOTA0OTYxLTAuNDQ5MjQsMi4zMzM5OTgtMC40NDkyMiw0LjI4NzEwOCBsIDAsOS45NjA5NC01LjQ4ODI4LDAgMC0xMS4zNjcxOSBjLTJlLTUtMi4wMTgyMTQtMC4wOTc3LTMuMzIwMjk2LTAuMjkyOTctMy45MDYyNDgtMC4xOTUzMy0wLjU4NTkyMi0wLjQ5ODA2LTEuMDIyMTItMC45MDgyLTEuMzA4NTk0LTAuNDEwMTctMC4yODY0NDItMC45NjY4MS0wLjQyOTY3MS0xLjY2OTkzLTAuNDI5Njg4LTAuODQ2MzYsMS43ZS01LTEuNjA4MDgsLjIyNzg4Mi0yLjI4NTE1LC42ODM1OTQtMC42NzcxLC40NTU3NDUtMS4xNjIxMiwxLjExMzI5Ny0xLjQ1NTA4LDEuOTcyNjU2LTAuMjkyOTgsLjg1OTM4OS0wLjQzOTQ2LDIuMjg1MTctMC40Mzk0NSw0LjI3NzM0IGwgMCwxMC4wNzgxMy01LjQ4ODI4LDB6Ii8+Cjwvc3ZnPg==" style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">', be: 'Metacritic', pt: 'Metacritic', zh: 'Metacritic', he: 'Metacritic', cs: 'Metacritic', bg: 'Metacritic'
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
        ".loading-dots-container { display: inline-flex; align-items: center; }" +
        ".loading-dots { display: inline-flex; align-items: center; gap: 0.4em; color: #ffffff; font-size: 1em; background: rgba(0, 0, 0, 0.3); padding: 0.6em 1em; border-radius: 0.5em; }" +
        ".loading-dots__text { margin-right: 1em; }" +
        ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
        ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
        ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
        "@keyframes loading-dots-bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.6; } 40% { transform: translateY(-0.5em); opacity: 1; } }";
    
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
        // Отримуємо активну активність БЕЗПЕЧНО
        var activityInstance = Lampa.Activity.active();
        if (!activityInstance || !activityInstance.activity) return;

        var activity = activityInstance.activity;
        var render = activity.render();

        if (!render || !render.length) {
            console.log('[RatingsPlugin] Render not found, retrying...');
            if (!retryCount || retryCount < 2) {
                setTimeout(function() { fetchAdditionalRatings(card, (retryCount || 0) + 1); }, 1000);
            }
            return;
        }

        var rateLine = render.find('.full-start-new__rate-line');
        if (!rateLine.length) {
            console.log('[RatingsPlugin] Rate line not found, retrying...');
            if (!retryCount || retryCount < 2) {
                setTimeout(function() { fetchAdditionalRatings(card, (retryCount || 0) + 1); }, 1000);
            }
            return;
        }

        console.log('[RatingsPlugin] Element found, processing...');

        // Перевірка на дублювання
        if (rateLine.find('.rate--rt, .rate--mc, .loading-dots-container').length) return;

        // Лоадер
        var loader = $('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">' + Lampa.Lang.translate("loading_dots") + '</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');
        rateLine.append(loader);

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
            
            // Повторна перевірка, чи ми все ще на тій самій сторінці
            if (!$.contains(document.documentElement, rateLine[0])) return;

            updateUI(render, rateLine, data || {}, normCard);
        };

        if (cached) {
            console.log('[RatingsPlugin] Using cached data');
            onComplete(cached);
        } else {
            console.log('[RatingsPlugin] Fetching IDs...');
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

                console.log('[RatingsPlugin] Requesting OMDB for ID: ' + imdbId);
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

    function updateUI(render, rateLine, data, card) {
        var fragment = document.createDocumentFragment();

        if (data.rt) fragment.appendChild(createRateItem(data.rt.toFixed(1), 'source_rt', 'rate--rt'));
        if (data.mc) fragment.appendChild(createRateItem(data.mc.toFixed(1), 'source_mc', 'rate--mc'));
        if (data.oscars) fragment.prepend(createRateItem(data.oscars, 'maxsm_omdb_oscars', 'rate--oscars'));

        var lastRate = rateLine.find('.full-start__rate:last')[0];
        if (lastRate && lastRate.parentNode) {
            if (data.oscars) rateLine.prepend($(fragment).find('.rate--oscars'));
            rateLine.append(fragment);
        } else {
            rateLine.append(fragment);
        }

        if (data.ageRating && data.ageRating !== 'N/A' && data.ageRating !== 'Not Rated') {
            var pg = render.find('.full-start__pg.hide');
            if (pg.length) pg.removeClass('hide').text(AGE_RATINGS[data.ageRating] || data.ageRating);
        }

        var imdbRate = render.find('.rate--imdb');
        if (imdbRate.length) {
            imdbRate.removeClass('hide');
            if (data.imdb && !isNaN(data.imdb)) imdbRate.children().eq(0).text(parseFloat(data.imdb).toFixed(1));
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
            rateLine.find('.full-start__rate:first').before(elem);
        }
    }

    // --- ЗАПУСК ---
    if (!window.combined_ratings_plugin) {
        window.combined_ratings_plugin = true;
        console.log('[RatingsPlugin] Plugin initialized');
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Повертаємо класичну затримку для надійності
                setTimeout(function() {
                    fetchAdditionalRatings(e.data.movie);
                }, 300);
            }
        });
    }
})();
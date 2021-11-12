function biketagExample(options) {
    let num_pages = 0;
    let current_page = 1;
    let previous_page = current_page;
    const rows_per_page = 3;

    /// Setup
    const getBikeTagApi = (opts, reinitialize = false) => {
        if (!window.biketagApi) {
            window.biketagApi = new biketag(opts)
        } else {
            console.log('setting new BikeTag config', {
                config: window.biketagApi.setConfiguration(opts, false, reinitialize)
            })
        }

        return window.biketagApi
    }

    /// Change Game Selector Event
    const changeGame = async (elem) => {
        if (elem.selectedIndex > -1) {
            load({
                ...options,
                game: elem[elem.selectedIndex].value
            })
        }
    }

    /// Load BikeTag Game Data into UI
    const load = async (opts) => {
        const loaderEl = document.getElementById('loaderContainer')
        loaderEl.classList.add('loading')

        opts.game = opts.game ? opts.game : 'test'
        let biketagAPI = getBikeTagApi(opts, true)
        const game = await biketagAPI.getGameData(opts.game)
        const pagesEl = document.getElementById('pageContent')

        pagesEl.innerHTML = ""
        num_pages = 0
        current_page = previous_page = 1

        const createImage = (url) => {
            const imgEl = document.createElement('img')
            const ext = /[^.]+$/.exec(url)
            if (['.jpg', '.jpeg', '.png', '.bmp'].indexOf(ext) !== -1) {
                url = url.replace(ext, `l${ext}`)
            } else if (ext.indexOf('.com/') === 0 && url.indexOf('//imgur.com/')) {
                url = `${url.replace('//imgur.com', '//i.imgur.com')}l.jpg`
            }

            imgEl.dataset.src = url
            imgEl.class = 'lazyload'
            imgEl.style = "width:100%;max-width:35vw"

            return imgEl
        }

        const createPage = (num = 1, rows = 4) => {
            const pageEl = document.createElement('div')

            pageEl.id = `page-${num}`
            pageEl.class = 'row'

            if (num > 1) {
                pageEl.style.display = "none";
                pageEl.style.visibility = "hidden";
            }

            for (let i = 1; i <= rows; i++) {
                const columnEl = document.createElement('div')

                columnEl.class = 'column'
                columnEl.id = `c${i}`
                pageEl.append(columnEl)
            }

            return pageEl
        }

        if (game.data) {
            const gameTextEl = document.getElementById("game")
            gameTextEl.innerText = game.data.name

            biketagAPI = getBikeTagApi({
                ...opts,
                imgur: {
                    hash: game.data.mainhash,
                },
                reddit: {
                    subreddit: game.data.subreddit,
                },
            }, true)
            const config = biketagAPI.getConfiguration()

            const albumTagsData = await biketagAPI.getTags(undefined, config.imgur.hash ? {
                source: 'imgur'
            } : {
                source: 'reddit',
                hash: 'n0'
            })
            const biketags = albumTagsData && albumTagsData.data ? albumTagsData.data : []
            window.biketags = biketags

            console.info(
                `BikeTag Client Configured -> ${biketags.length ? 'BikeTags Retrieved' : `No BikeTags For Game: ${game.data.name}`}`, {
                    game: game.data,
                    biketags,
                })

            if (biketags.length) {
                const imagesToLoad = []
                let pageContentEl = null
                let columns = []
                for (let i = 0, j = 0, k = 0; i < biketags.length; ++i) {
                    const foundImageUrl = biketags[i].foundImageUrl
                    const mysteryImgUrl = biketags[i].mysteryImageUrl

                    if (!(mysteryImgUrl || foundImageUrl)) {
                        return
                    }

                    if (k === 0) {
                        /// Create new page
                        k++
                        pageContentEl = createPage(++num_pages)

                        columns = [
                            pageContentEl.querySelector('#c1'),
                            pageContentEl.querySelector('#c2'),
                            pageContentEl.querySelector('#c3'),
                            pageContentEl.querySelector('#c4'),
                        ]
                    }

                    if (foundImageUrl) {
                        const foundImage = createImage(foundImageUrl)
                        imagesToLoad.push(foundImage)
                        columns[j++].appendChild(foundImage)
                    }

                    if (j > 3) {
                        j = 0
                        k++
                    }

                    if (mysteryImgUrl) {
                        const mysteryImage = createImage(mysteryImgUrl)
                        imagesToLoad.push(mysteryImage)
                        columns[j++].appendChild(mysteryImage)
                    }

                    if (j > 3) {
                        j = 0
                        k++
                    }

                    if (k > rows_per_page) {
                        pagesEl.appendChild(pageContentEl)
                        pageContentEl = null
                        k = 0
                    }
                }

                if (pageContentEl) {
                    pagesEl.appendChild(pageContentEl)
                }

                lazyload(imagesToLoad)
                changePage(1)
            }
            loaderEl.classList.remove('loading')
        }
    }

    /// Populate the Change Game Selector from all available games
    const setAllGames = async (opts) => {
        const biketagAPI = getBikeTagApi(opts, true)
        const allGames = await biketagAPI.getGameData()

        if (allGames.data && allGames.data.length) {
            const gameChangerEl = document.getElementById('gameChanger')
            for (let game of allGames.data) {
                const gameSelectEl = document.createElement('option')
                gameSelectEl.text = game.name
                gameSelectEl.value = game.slug
                gameChangerEl.appendChild(gameSelectEl)
            }
        }
    }

    /// ... Pagination Methods ... ///
    const prevPage = () => {
        if (current_page > 1) {
            previous_page = current_page;
            current_page--;
            changePage(current_page);
        }
    }

    const nextPage = () => {
        if (current_page < numPages()) {
            previous_page = current_page;
            current_page++;
            changePage(current_page);
        }
    }

    const changePage = (page) => {
        var btn_next = document.getElementById("btn_next");
        var btn_prev = document.getElementById("btn_prev");
        var pageContentEls = document.querySelectorAll("#pageContent > *");
        var page_span = document.getElementById("page");

        // Validate page
        if (page < 1) page = 1;
        if (page > numPages()) page = numPages();

        console.log('changePage', {
            page,
            pageContentEls,
            current_page,
            previous_page
        })
        if (pageContentEls.length) {
            if (previous_page < pageContentEls.length) {
                pageContentEls[previous_page - 1].style.display = "none";
                pageContentEls[previous_page - 1].style.visibility = "hidden";
            }

            pageContentEls[current_page - 1].style.display = "flex";
            pageContentEls[current_page - 1].style.visibility = "visible";
        }
        page_span.innerHTML = page + "/" + numPages();

        if (page == 1) {
            btn_prev.style.visibility = "hidden";
        } else {
            btn_prev.style.visibility = "visible";
        }

        if (page == numPages()) {
            btn_next.style.visibility = "hidden";
        } else {
            btn_next.style.visibility = "visible";
        }
    }

    const numPages = () => {
        return Math.ceil(num_pages / rows_per_page);
    }

    /// ... BOOTSTRAP ... ///
    setAllGames(options)

    /// ... LOAD .. ///
    window.onload = function () {
        changePage(1);
    };

    window.changePage = changePage
    window.changeGame = changeGame
    window.nextPage = nextPage
    window.prevPage = prevPage
}
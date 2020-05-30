export class Page {
    constructor(identifier, mountpoint = ".our-content", titleSelector = ".our-title") {
        this.identifier = identifier;
        this.moutpoint = mountpoint;
        this.atLeastOnceMounted = false;
        this.titleSelector = titleSelector;
        this.title = "one Page Title"; //to override


        /**
         * level = 0 -> no cache
         * level = 1 -> cache into javascript-memory, but remove from dome + onUnMountCall()
         * level = 2 -> cache, dont remove from dome + hide() + onUnMountCall()
         * level = 3 -> cache, dont remove from dome + hide() + no onMount()-call, if cache have data + no onUnMountCall()
         */
        this.cacheLevel = 0; //to override
        //    this.cacheChanges = true;
        this.cachedInMemory = ""; //private attribut
        this.cachedElem = ""; //private attribut
        this.clearCachex = false;
        this.counter = 0; //private attribut
    }

    //to-ovveride
    onRegister() {}

    //Dont override
    mount() {

        let thisdata = this;

        function createRandomElem() {
            thisdata.counter++;
            let elem = "page-" + thisdata.identifier + thisdata.counter;
            $(thisdata.titleSelector).html(thisdata.title);
            $(thisdata.moutpoint).append(`<div class="page-content ${elem}" style="display:none;"></div>`);
            return elem;
        }

        let elem = "";
        if ((!this.atLeastOnceMounted) || this.clearCachex) {
            this.clearCachex = false;
            elem = createRandomElem();
            $("." + elem).html(this.content());
            this.onMount();
        } else {


            switch (this.cacheLevel) {
                case 0:
                    elem = createRandomElem();
                    $("." + elem).html(this.content());
                    this.onMount();
                    break;
                case 1:
                    elem = createRandomElem();
                    $("." + elem).html(this.cachedInMemory);
                    this.onMount();
                    break;
                case 2:
                    elem = this.cachedElem;
                    this.onMount();
                    break;
                case 3:
                    elem = this.cachedElem;
                    break;
            }


        }

        if (!this.atLeastOnceMounted) {
            this.atLeastOnceMounted = true;
            this.onFirstLoad();
        }

        this.onLoad();

        $("." + elem).show(1000);

    }

    //to-ovveride
    onMount() {}

    //to-ovveride
    onLoad() {};

    //to-ovveride
    onFirstLoad() {}

    //to-ovveride
    onUnLoad() {}

    //Dont override
    unmount() {
        let elem = "page-" + this.identifier + this.counter;
        $(this.titleSelector).html("");


        let cacheLevelLocal = this.cacheLevel;
        if (this.clearCachex) {
            cacheLevelLocal = 0;
        }

        switch (cacheLevelLocal) {
            case 0:
                //ee jquery::detach(), eventually interessting for caching purposes
                $("." + elem).hide(1, function () { $("." + elem).remove()});
                this.onUnLoad();
                this.onUnMount();
                break;
            case 1:
                this.cachedInMemory = $("." + elem).html();
                $("." + elem).hide(1, function () { $("." + elem).remove()});
                this.onUnLoad();
                this.onUnMount();
                break;
            case 2:
                this.cachedElem = elem;
                $("." + elem).hide(1);
                this.onUnLoad();
                this.onUnMount();

                break;
            case 3:
                this.cachedElem = elem;
                $("." + elem).hide(1);
                this.onUnLoad();
                break;
        }
    }

    //to-ovveride
    onUnMount() {}

    //to-ovveride
    content() {
        return `template-page, identifier: ${this.identifier}`;
    };

    //Dont override
    clearCache() {
        this.clearCachex = true;
        this.cachedElem = "";
        this.cachedInMemory = "";
    }

    //Dont override
    reload() {
        this.unmount();
        this.mount();
    }

}




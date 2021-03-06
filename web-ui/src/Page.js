export class Page {
    constructor(parent, identifier, mountpoint = ".our-content", titleSelector = ".our-title") {
        this.parent = parent;
        this.config = parent.dependencies.config;
        this.identifier = identifier;
        this.moutpoint = mountpoint;
        this.atLeastOnceMounted = false;
        this.titleSelector = titleSelector;
        this.title = "one Page Title"; //to override
        this.titleActive = true;//to override with false, if you dont want present the title


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

    //Dont override
    setIdentifier(identifier) {
        this.identifier = identifier;
    }

    //this method is called at the time (and only one time) the whole webapplication is started
    //to-ovveride
    onRegister() {}

    //Dont override
    mount() {

        let thisdata = this;
        $(this.titleSelector).html("");//delete old titel in all cases
        if (this.titleActive) {$(this.titleSelector).html(this.title);}//only set the new one if active
        $("title").html(this.title);

        function createRandomElem() {
            thisdata.counter++;
            let elem = "page-" + thisdata.identifier + thisdata.counter;
            $(thisdata.moutpoint).append(`<div class="page-content ${elem}" style="display:none;"></div>`);
            return elem;
        }

        let elem = "";
        if ((!this.atLeastOnceMounted) || this.clearCachex) {
            this.clearCachex = false;
            elem = createRandomElem();
            $("." + elem).html(this.content());
            this.onMountx();
        } else {


            switch (this.cacheLevel) {
                case 0:
                    elem = createRandomElem();
                    $("." + elem).html(this.content());
                    this.onMountx();
                    break;
                case 1:
                    elem = createRandomElem();
                    $("." + elem).html(this.cachedInMemory);
                    this.onMountx();
                    break;
                case 2:
                    elem = this.cachedElem;
                    this.onMountx();
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

        if (this.config.pageChangeAnimation) {
            $("." + elem).show(1000);
        } else {
            $("." + elem).show(1);
        }


    }


    //to-ovveride
    onMount() {}


    //Dont override
    onMountx() {
        this.init_popover();
        this.onMount();
    }

    init_popover() {

        $('.pover').attr("href", "#");
        $('.pover').attr("tabindex", "0");
        $('.pover').click(function (event) {
            event.preventDefault();
        });
        $('.pover').popover({
            trigger: 'focus',
            container: 'body',
            html: true
        });


    }


    //this method is called on each load of the page-section
    //to-ovveride
    onLoad() {};

    //this method is called on first load of the page-section
    //to-ovveride
    onFirstLoad() {}


    //Dont-override
    onUnLoadx() {
        $('.pover').popover('hide');
        this.onUnLoad();
    }

    //this method is called on each unload of the page-section
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
                this.onUnLoadx();
                this.onUnMount();
                break;
            case 1:
                this.cachedInMemory = $("." + elem).html();
                $("." + elem).hide(1, function () { $("." + elem).remove()});
                this.onUnLoadx();
                this.onUnMount();
                break;
            case 2:
                this.cachedElem = elem;
                $("." + elem).hide(1);
                this.onUnLoadx();
                this.onUnMount();

                break;
            case 3:
                this.cachedElem = elem;
                $("." + elem).hide(1);
                this.onUnLoadx();
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




export class Page {
    constructor(identifier, mountpoint=".our-content", titleSelector=".our-title") {
        this.identifier = identifier;
        this.moutpoint = mountpoint;
        this.titleSelector = titleSelector;
        this.title = "one Page Title";

        //TODO to fullfill the new cacheLevels
        /**
         * level = 0 -> no cache
         * level = 1 -> cache into javascript-memory, but remove from dome
         * level = 2 -> cache, dont remove from dome + hide()
         * level = 3 -> cache, dont remove from dome + hide() + no onMount()-call, if cache have data
         */
        this.cacheChangesLevel = 0;
        this.cacheChanges=true; //TODO remove this old cache-boolean
        this.cachedChanges = "";
        this.counter = 0;
    }

    //to-ovveride
    onRegister() {}

    //Dont override
    onMountIntern() {
        this.counter++;
        let elem = "page-" + this.identifier + this.counter;
        $(this.titleSelector).html(this.title);
        $(this.moutpoint).append(`<div class="page-content ${elem}" style="display:none;"></div>`);
        if (this.cacheChanges === true && this.cachedChanges !=="") {
            $("." + elem).html(this.cachedChanges);
        } else {
            $("." + elem).html(this.content());
        }
        if (this.onMount() !== false) {
            $("." + elem).show(1000);
        }

    }

    //to-ovveride
    onMount() {}

    //Dont override
    onUnMountIntern() {
        let elem = "page-" + this.identifier + this.counter;
        if (this.cacheChanges === true) {
            this.cachedChanges = $("." + elem).html();
        }
        $(this.titleSelector).html("");
        $("." + elem).hide(1,function(){ $("." + elem).remove()});//TODO see jquery::detach(), eventually interessting for caching purposes

        this.onUnMount();
    }

    //to-ovveride
    onUnMount() {}

    //to-ovveride
    content() {
        return `template-page, identifier: ${this.identifier}`;
    };

}




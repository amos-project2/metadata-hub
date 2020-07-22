export class Paginator {

    constructor(id, countElementsPerPage, countAllElements, startPage) {

        this.listener = [];

        this.id = id;
        this.countElementsPerPage = countElementsPerPage;
        this.countAllElements = countAllElements;
        this.page = -1;

        this.countAllPages = 0;
        this.startIndex = 0;
        this.endIndex = 0;

        this.setPage(startPage);
    }


    setPage(page) {
        if (page > this.countAllPages) page = this.countAllPages;
        if (page < 1) page = 1;

        if (this.page === page) return;

        this.page = page;
        this.adjustState();
    }

    setElementsPerPage(count) {
        if (count < 1) count = 1;
        if (this.countElementsPerPage === count) return;

        this.countElementsPerPage = count;
        this.adjustState();
    }

    registerPageListener(listenerFunc) {

        this.listener.push(listenerFunc);

    }

    notifyListener() {

        this.listener.forEach(value => value(this))

    }

    adjustState() {

        this.countAllPages = Math.ceil(this.countAllElements / this.countElementsPerPage);

        //we need it here also, because the countAllPages can change
        if (this.page > this.countAllPages) this.page = this.countAllPages;
        if (this.page < 1) this.page = 1;

        this.startIndex = (this.page - 1) * this.countElementsPerPage;
        this.endIndex = (this.page * this.countElementsPerPage) - 1;


        this.notifyListener();
    }


    addListener() {
        let thisdata = this;
        $(`.pageId${this.id}`).click(function (event) {
            event.preventDefault();
            thisdata.setPage($(this).data("page"));
        })


    }

    //private
    getPageHtml(position, active) {
        let active_marker = ``;
        let active_code = ``;
        if (active) {
            active_marker = `active`;
            active_code = `<span class="sr-only">(current)</span>`;
        }

        let page_int = position;
        return `<li class="page-item ${active_marker}"><a class="page-link pageId${this.id}" href="#!" data-page="${page_int}">${page_int} ${active_code}</a></li>`;

    }


    getHtmlCode() {

        let page1 = this.getPageHtml(this.page - 2, false);
        let page2 = this.getPageHtml(this.page - 1, false);
        let page3 = this.getPageHtml(this.page, true);
        let page4 = this.getPageHtml(this.page + 1, false);
        let page5 = this.getPageHtml(this.page + 2, false);

        let previous = ` <li class="page-item"><a class="page-link page-previous pageId${this.id}" href="#!" data-page="${this.page - 1}">Previous</a></li>`;
        let first = ` <li class="page-item"><a class="page-link page-first pageId${this.id}" href="#!" data-page="1">First</a></li>`;
        let last = `  <li class="page-item"><a class="page-link page-last pageId${this.id}" href="#!" data-page="${this.countAllPages}">Last</a></li>`;
        let next = ` <li class="page-item"><a class="page-link page-next pageId${this.id}" href="#!" data-page="${this.page + 1}">Next</a></li> `;

        let tmp = "";

        if (this.page === 1) {
            page1 = "";
            page2 = "";
            previous = "";
            first = "";
        }

        if (this.page === 2) {
            page1 = "";
        }


        if (this.page < 3) {
            first = "";
        }


        if (this.page > this.countAllPages - 3) {
            last = "";

        }

        if (this.page === this.countAllPages) {
            page5 = "";
            page4 = "";
            next = "";
            last = "";
        }

        if (this.page === this.countAllPages - 1) {
            page5 = "";
        }

        if (this.countAllPages > 5) {
            tmp = first + previous + page1 + page2 + page3 + page4 + page5 + next + last;
        } else {

            let thisdata = this;

            function gH(position) {
                return thisdata.getPageHtml(position, thisdata.page === position);
            }

            if (this.countAllPages === 0) tmp = "";
            if (this.countAllPages === 1) tmp = gH(1);
            if (this.countAllPages === 2) tmp = gH(1) + gH(2);
            if (this.countAllPages === 3) tmp = gH(1) + gH(2) + gH(3);
            if (this.countAllPages === 4) tmp = gH(1) + gH(2) + gH(3) + gH(4);
            if (this.countAllPages === 5) tmp = gH(1) + gH(2) + gH(3) + gH(4) + gH(5);
        }

        // language=HTML
        return `
            <nav aria-label="Pagination">
                <ul class="pagination">
                    ${tmp}
              </ul>
            </nav>

`;

    }


}

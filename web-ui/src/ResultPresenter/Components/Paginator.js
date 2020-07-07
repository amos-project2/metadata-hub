export class Paginator {

    constructor(id, countElementsPerPage, countAllElements, startPage) {

        this.listener = [];

        this.id = id;
        this.countElementsPerPage = countElementsPerPage;
        this.countAllElements = countAllElements;
        this.page = startPage;

        this.countAllPages = 0;
        this.startIndex = 0;
        this.endIndex = 0;

        this.setPage(1);
    }


    setPage(page) {
        this.page = page;
        this.adjustState();
    }

    setElementsPerPage(count) {
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

    getHtmlCode() {

        let page_int = 0;

        page_int = this.page - 2;
        let page1 = `<li class="page-item"><a class="page-link pageId${this.id}" href="#!" data-page="${page_int}">${page_int}</a></li>`;

        page_int = this.page - 1;
        let page2 = `<li class="page-item"><a class="page-link pageId${this.id}" href="#!" data-page="${page_int}">${page_int}</a></li>`;

        page_int = this.page;
        let page3 = `<li class="page-item"><a class="page-link pageId${this.id}" href="#!" data-page="${page_int}">${page_int}</a></li>`;

        page_int = this.page + 1;
        let page4 = `<li class="page-item"><a class="page-link pageId${this.id}" href="#!" data-page="${page_int}">${page_int}</a></li>`;

        page_int = this.page + 2;
        let page5 = `<li class="page-item"><a class="page-link pageId${this.id}" href="#!" data-page="${page_int}">${page_int}</a></li>`;


        let previous = ` <li class="page-item"><a class="page-link page-previous pageId${this.id}" href="#!" data-page="${this.page - 1}">Previous</a></li>`;
        let first = ` <li class="page-item"><a class="page-link page-first pageId${this.id}" href="#!" data-page="1">First</a></li>`;
        let last = `  <li class="page-item"><a class="page-link page-last pageId${this.id}" href="#!" data-page="${this.countAllPages}">Last</a></li>`;
        let next = ` <li class="page-item"><a class="page-link page-next pageId${this.id}" href="#!" data-page="${this.page + 1}">Next</a></li> `;

        let tmp = "";


        if (this.page < 3) {
            page1 = "";
            page2 = "";
            first = "";
        }

        if (this.page === 1) {
            previous = "";
        }

        if (this.page > this.countAllPages - 3) {
            page5 = "";
            page4 = "";
            last = "";

        }

        if (this.page === this.countAllPages) {
            next = "";
        }

        tmp = first + previous + page1 + page2 + page3 + page4 + page5 + next + last;


        // language=HTML
        return `
            <nav aria-label="Pagination">
                <ul class="pagination">
                    ${tmp}
              </ul>
            </nav>`;


    }


}

import {Page} from "../Page";
import {ResultPresenter} from "../ResultPresenter/ResultPresenter";
import {ResultPresenterOld} from "../ResultPresenter/ResultPresenterOld";

export class GraphqlQueryEditor extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "GraphQl Query Editor";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;
        //this.resultPresenter = new ResultPresenter(this.graphQlFetcher);
        this.resultPresenter = new ResultPresenterOld(this.graphQlFetcher);
    }

    content() {

        // language=HTML
        return `
            <form class="q-send-query-editor">
                <div class="form-group">
                    <label for="q_textInput">GraphQL</label>
                    <textarea class="form-control" id="q_textInput" rows="10" placeholder="query\n{\n  {\n\n  }\n}"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Send</button>
            </form>
            <br>
            <div class="resultView3">
                ${this.resultPresenter.getHtml()}
            </div>
        `;
    }

    onMount() {
        let thisdata = this;

       // this.resultPresenter.onMount();

        $(".q-send-query-editor").submit(function (event) {
            event.preventDefault();
            thisdata.resultPresenter.generateResultAndInjectIntoDom($("#q_textInput").val());
        });

    }

}



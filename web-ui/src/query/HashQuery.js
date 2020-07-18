import {Page} from "../Page";
import {ResultPresenter} from "../ResultPresenter/ResultPresenter";
import {FormGraphQl} from "./FormQueryEditor/Components/FormGraphQl";
import {GraphQlIntrospectionModel} from "./FormQueryEditor/Modals/GraphQlIntrospectionModel";

export class HashQuery extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Hash Query";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;

        this.graphQLIntrospectionModal = new GraphQlIntrospectionModel(this.parent.storage, false);
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher, this.graphQLIntrospectionModal, this.parent.dependencies.restApiFetcherServer);

    }

    content() {
        // language=HTML
        return `
            <form class="q-send-hash-editor">

                <div class="form-group">
                    <label for="q_textInput">File-Hash</label>
                    <input type="text" class="form-control" id="h-input" placeholder="File-Hash">
                </div>


                <div class="form-group">
                    <label for="fileSelection">Select a file to calculate the sha256 hash</label>
                    <input type="file" class="form-control-file" id="hash_file">
                </div>

                <br>
                <button type="submit" class="btn btn-success">Send</button>
                <button type="button" class="btn btn-primary open-hashquery">Open Intermediate Query</button>

            </form>
            <br>
             <div class="resultView2">
                ${this.resultPresenter.getHtml()}
            </div>

            ${this.graphQLIntrospectionModal.getHtmlCode()}
            ${this.resultPresenter.viewModal.getHtmlCode()}
        `;
    }

    onMount() {
        let thisdata = this;

        this.graphQLIntrospectionModal.onMount();
        this.resultPresenter.onMount();

        $(".q-send-hash-editor").submit(function (event) {
            event.preventDefault();
            let formGraphQl = thisdata.getQuery();
            //thisdata.resultPresenter.generateResultAndInjectIntoDom(formGraphQl.generateAndGetGraphQlCode());
            thisdata.resultPresenter.updateState(formGraphQl)
        });

        //Necessary for the hash.function
        var sha256 = require('js-sha256');

        var input = $("#hash_file");
        input.bind('change', function (event) {

            var file = event.target.files[0];
            var reader = new FileReader();

            reader.onload = function (event) {
                var binary = event.target.result;
                var sha_hash = sha256.update(binary);
                $("#h-input").val(sha_hash);
            };

            reader.readAsArrayBuffer(file);
        });

        $(".open-hashquery").click(function () {
            thisdata.graphQLIntrospectionModal.openModalWithContent(thisdata.getQuery().generateAndGetGraphQlCode());
        });

    }

    getQuery() {

        let formGraphQl = new FormGraphQl();
        formGraphQl.fileHashes = `file_hashes: ["${$("#h-input").val()}"]`;
        return formGraphQl;
    }


}

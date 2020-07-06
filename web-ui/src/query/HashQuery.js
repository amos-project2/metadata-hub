import {Page} from "../Page";
import {ResultPresenter} from "../ResultPresenter/ResultPresenter";

export class HashQuery extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Hash Query";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher);
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
                <button type="submit" class="btn btn-primary">Send</button>

            </form>
            <br>
             <div class="resultView2">
                ${this.resultPresenter.getHtml()}
            </div>
        `;
    }

    onMount() {
        let thisdata = this;

        this.resultPresenter.onMount();

        $(".q-send-hash-editor").submit(function (event) {
            event.preventDefault();
            thisdata.resultPresenter.generateResultAndInjectIntoDom(thisdata.getQuery());
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

    }

    getQuery() {
        return `
            query
            {
              searchForFileMetadata(file_hashes: ["${$("#h-input").val()}"])
              {
                id,
                crawl_id,
                dir_path,
                name,
                type,
                creation_time,
                access_time,
                modification_time,
                file_hash,
                metadata
                {
                  name,
                  value,
                }
              }
            }
        `;
    }


}

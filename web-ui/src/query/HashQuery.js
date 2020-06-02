import {Page} from "../Page";
import {ResultPresenter} from "../buisnesslogic/ResultPresenter";

export class HashQuery extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Hash Query";
        this.cacheLevel = 3;
        this.graphQlFetcher = this.parent.dependencies.graphQlFetcher;
        this.resultPresenter = new ResultPresenter(this.graphQlFetcher);
    }

    content() {
        return `
<form class="q-send-hash-editor">
<div class="form-group" >
 <label for="q_textInput">File-Hash</label>
   <input type="text" class="form-control" id="h-input" placeholder="File-Hash">
</div>
  <button type="submit" class="btn btn-primary">Send</button>
</form>
<br>
<div class="resultView2"></div>


        `;
    }

    onMount() {
        $(".resultView2").html(this.resultPresenter.getHtml());

        let thisdata = this;
        $(".q-send-hash-editor").submit(function (event) {
            event.preventDefault();
            thisdata.resultPresenter.generateResultAndInjectIntoDom(thisdata.getQuery());
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

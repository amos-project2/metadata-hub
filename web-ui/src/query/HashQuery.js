import {Page} from "../Page";
import {ResultPresenter} from "../buisnesslogic/ResultPresenter";
import * as CryptoJS from "crypto-js";

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


<div class="form-group">
<label for="fileSelection">Select a file to calculate the sha256 hash</label>
<input type="file" class="form-control-file" id="hash_file">
</div>

<br>
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
            let filepath_input = $("#hash_file").val();
            if( filepath_input != null){
            }
            thisdata.resultPresenter.generateResultAndInjectIntoDom(thisdata.getQuery());
        });

        $("#hash_file").change(function(event){
            event.preventDefault();

            var file = event.target.files[0];
            console.log(file);
            var reader = new FileReader();

            reader.onload = function(event){
                console.log(event.target);
                var binary = event.target.result;
                console.log(binary);
                var shaHash = CryptoJS.SHA256(binary).toString();
                console.log("ShaHash: " + shaHash);
            };

            // reader.readAsText(file);
            reader.readAsBinaryString(file);
            // reader.readAsDataURL(file);
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

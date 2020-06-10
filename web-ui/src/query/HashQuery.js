import {Page} from "../Page";
import {ResultPresenter} from "../buisnesslogic/ResultPresenter";
import * as CryptoJS from "crypto-js";
//import {hex_sha256} from "./sha256Calculator";
//import {sha256} from "./s2.js";




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

        var sha256 = require('js-sha256'); //THIS HERE YOU HAVE TO ADD


        $(".q-send-hash-editor").submit(function (event) {
            event.preventDefault();
            thisdata.resultPresenter.generateResultAndInjectIntoDom(thisdata.getQuery());
        });

        var input = $("#hash_file");
        input.bind('change', function(event) {
            let file = input[0].files[0];
           const buffer= file.arrayBuffer();



           // alert(sha256.update(buffer));
            //console.log(event);
           // var file = event.target.files[0];
          //  console.log(file);
            var reader = new FileReader();

            reader.onload = function(event){
                console.log(event.target);
                var binary = event.target.result;
                console.log(binary);
                //alert(sha256.update(binary));
                var shaHash = CryptoJS.SHA256(binary).toString();
                var blablub=CryptoJS.SHA256(binary);
                console.log("hatschi");
                console.log(hex_sha256(binary));
                // var shaHash = CryptoJS.MD5(binary).toString();
                $("#h-input").val(shaHash);
                console.log("ShaHash: " + shaHash);
            };

            // reader.readAsText(file);
           // reader.readAsBinaryString(file);
            reader.readAsArrayBuffer(file); //I DONT TESTET IT WITH BINARYSTRING
            // reader.readAsDataURL(file);



            reader.onloadend = function (event) {
                var binary = event.target.result;
                var shaHash = CryptoJS.SHA256(binary).toString();


                //THIS HERE IS THE IMPORTANT CHANGE
                // npm install js-sha256
                $("#h-input").val(sha256.update(binary));

               // alert(shaHash);

            };

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

import {Page} from "../Page";

export class Testname extends Page {
    constructor(identifier, mountpoint, titleSelector) {
        super(identifier, mountpoint, titleSelector);
        this.title = "Testname-Title";
    }

    content() {
        return `<div class="my-test-class-element" style="font-size: 20px; color:blue;">hey this is the specific testname-content</div>

<!-- Button trigger modal -->
<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
  Launch our demo modal
</button>

<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">The identifier: ${this.identifier}</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        yeah here we can have some content
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">OK</button>
      </div>
    </div>
  </div>
</div>



`;
    }

    onMount() {
        $(".my-test-class-element").click(function () {
            $('#myModal').modal()
        });
    }

}

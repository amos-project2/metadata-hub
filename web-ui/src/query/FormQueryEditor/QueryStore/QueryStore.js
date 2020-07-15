import {Page} from "../../../Page";
import {StoreService} from "./StoreService";

import * as moment from 'moment';

export class QueryStore extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Query Store";
        this.cacheLevel = 3;
        this.storeService = null;

        this.author = localStorage.getItem("username");
        this.isAdmin = localStorage.getItem('logged_in') === "admin";

        this.notAdminExtension = "";
        if (!this.isAdmin) {
            this.notAdminExtension = "display:none";
        }


    }

    setStoreService(storeService) {
        this.storeService = storeService
    }

    content() {
        // language=HTML
        return `

             <div class="row mb-3 ml-3">

                      <div class="form-group row">
                        <label for="author-filter" class="col-sm-4 col-form-label">Author-Filter</label>
                        <div class="col-sm-8">
                        <input type="text" class="form-control" id="author-filter" value="${this.author}">
                        </div>
                    </div>


                </div>


            <div class="storage-load-container" style="display: none">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <div class="storage-container container pt-4 pb-4" style="display:none"></div>

<div class="col pb-4"><button type="button" class="btn btn-sm btn-danger delete-all" style="${this.notAdminExtension}">Delete All</button></div>

`;


    }

    onMount() {
        $(".delete-all").click(() => {
            this.storeService.deleteAllQuery(function () {}, function () {}, () => {
                this.loadContent();
            });
        });

        $("#author-filter").on('input propertychange', function () {
            if ($(this).val().trim() === "") {
                $(".storage-row").stop(true).show(1000);
                return;
            }

            let theVal = $(this).val();

            $(".storage-row").each(function () {
                if ($(this).data("author").trim().toLowerCase() === theVal.trim().toLowerCase()) {
                    $(this).stop(true).show(1000);
                } else {
                    $(this).stop(true).hide(1000);
                }
            });

        });
    }


    loadContent() {
        $(".storage-container").html("");
        $(".storage-container").stop(true).hide();
        $(".storage-load-container").stop(true).show();
        this.storeService.getAllStoredQueriesMetadata((data) => {

            $(".storage-load-container").stop(true).delay(1000).hide(1000);

            if (data.length === 0) {
                $(".storage-container").html("There arent any Query-Editor-Views saved yet.");
                $(".storage-container").stop(true).show(1000);
            }

            data.forEach(value => {
                // language=HTML


                let dateString = moment(new Date(value.create_time)).format('YYYY-MM-DD HH:MM');

                let hiddenElement = this.notAdminExtension;
                if (this.author.trim() === value.author.trim()) {
                    hiddenElement = "";
                }

                $(".storage-container").append(`

                    <div class="storage-row row mb-3 detail-view-element my-storage-row-${value.id}" data-author="${value.author}">
                        <div class="col font-weight-bold">${value.author}</div>
                        <div class="col">${value.title}</div>
                        <div class="col">${dateString}</div>
                        <div class="col"><button type="button" class="btn btn-sm btn-success restore-storage-element" data-id="${value.id}">Restore</button></div>
                        <div class="col"><button type="button" class="btn btn-sm btn-danger delete-storage-element" data-id="${value.id}" style="${hiddenElement}">Delete</button></div>
                    </div>

                `);
                console.log(value);
            });

            let thisdata = this;
            $(".restore-storage-element").click(function () {
                thisdata.storeService.restoreEditor($(this).data("id"));
            });

            $(".delete-storage-element").click(function () {
                thisdata.storeService.deleteQuery($(this).data("id"));
                $(".my-storage-row-" + $(this).data("id")).stop(true).hide(2000);
            });


            $(".storage-container").stop(true).delay(300).fadeIn(2000);
            setTimeout(function () {
                $("#author-filter").trigger("propertychange");
            }, 1000);


        }, () => {
            $(".storage-container").html("There was an error, while loading the content");
            $(".storage-container").stop(true).show(1000);
        })


    }


    onLoad() {
        this.loadContent();
    }

    onUnLoad() {
        $(".storage-container").html("");//remove dome-elements
        $(".storage-container").stop(true).hide();
    }

}

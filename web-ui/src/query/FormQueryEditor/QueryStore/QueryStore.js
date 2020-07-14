import {Page} from "../../../Page";
import {StoreService} from "./StoreService";

import * as moment from 'moment';

export class QueryStore extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Query Store";
        this.cacheLevel = 3;
        this.storeService = null;

    }

    setStoreService(storeService) {
        this.storeService = storeService
    }

    content() {
        // language=HTML
        return `
            <div class="storage-load-container" style="display: none">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <div class="storage-container container pt-4" style="display:none"></div>`;
    }

    onMount() {


    }


    loadContent() {
        $(".storage-container").html("");
        $(".storage-container").stop(true).hide();
        $(".storage-load-container").stop(true).show();
        this.storeService.getAllStoredQueriesMetadata((data) => {

            $(".storage-load-container").stop(true).delay(1000).hide(1000);

            data.forEach(value => {
                // language=HTML


                let dateString = moment(new Date(value.create_time)).format('YYYY-MM-DD HH:MM');
                $(".storage-container").append(`

                    <div class="row mb-3 detail-view-element my-storage-row-${value.id}">
                        <div class="col font-weight-bold">${value.author}</div>
                        <div class="col">${dateString}</div>
                        <div class="col"><button type="button" class="btn btn-sm btn-success restore-storage-element" data-id="${value.id}">Restore</button></div>
                        <div class="col"><button type="button" class="btn btn-sm btn-danger delete-storage-element" data-id="${value.id}">Delete</button></div>
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

        }, () => {
            $(".storage-container").html("There was an error, while loading the content");
            $(".storage-container").stop(true).show(100);
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

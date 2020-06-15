import {Page} from "../Page";

export class CrawlerController extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "";
        this.restAPIFetcherCrawler=this.parent.dependencies.restApiFetcherCrawler;
        this.cacheLevel = 3;
        //use 0 for no caching (the dom for this page will be deleted and onMound/onUnMount is called each enter and leaving the page here)
        //use 3 for complete caching(the dome for this page stay after leaving
        //     (its only hidden, be careful, of using html-classes/ids in more areas of the whole webpage, that they dont overlap))
        //     onMount is only called at the first time, unOnLoad-never (except if you use the delete-cache-method)
        //     i think using 3 here is a good idea, so the user can work on a formular go to other page and go back to work on
        //     the dynamic stuff in the page is handled by javascript, timers who reload parts for page in a specific way for specific page-components


        //here you set the title-attribut
        //you can here also set the caching_behavour and much more
        //take a look in class Page
    }

    content() {
        var thisData = this;
        return `
            <div class="container">
                <div class="row">
                    <div class="col" align="center">
                        <h3>Information</h3>
                        <p>
                            This is the panel for controlling the crawler.
                            The crawler has three states:
                            <b>ready</b>, <b>running</b> and <b>paused</b>.
                            All these actions are safe to use in all states,
                            but some may have no impact in a certain state.
                            For example, stopping the crawler when it was running
                            will stop the current execution, but stopping when
                            the crawler was ready will have no consequences.
                        </p>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col" align="center">
                        <h3>Actions</h3>
                    </div>
                </div>
                <div class="row">
                    <div class="col" align="center">
                        <button id="stop-button" type="button" class="btn btn-primary">
                            STOP
                        </button>
                    </div>
                    <div class="col">
                        <p>
                            <b>Stop</b> the current execution.
                        </p>
                    </div>
                    <div class="col">
                        <p>
                            If the crawler is ready, the action will be ignored.
                            Otherwise, the running/paused execution will be aborted.
                        </p>
                    </div>
                </div>
                <div class="row">
                    <div class="col" align="center">
                        <button id="pause-button" type="button" class="btn btn-primary">
                            PAUSE
                        </button>
                    </div>
                    <div class="col">
                        <p>
                            <b>Pause</b> the current execution.
                        </p>
                    </div>
                    <div class="col">
                        <p>
                            If the crawler is ready or already paused,
                            the action will be ignored.
                            Otherwise, it will pause the current exeution
                            so that it can be continued later on.
                        </p>
                    </div>
                </div>
                <div class="row">
                    <div class="col" align="center">
                        <button id="continue-button" type="button" class="btn btn-primary">
                            CONTINUE
                        </button>
                    </div>
                    <div class="col">
                        <p>
                            <b>Continue</b> a paused execution of the crawler.
                        </p>
                    </div>
                    <div class="col">
                        <p>
                            If the crawler is ready or already running,
                            the action will be ignored.
                            Otherwise, it will continue the currently
                            paused execution.
                        </p>
                    </div>
                </div>
                <div class="row">
                    <div class="col" align="center">
                        <button id="start-button" type="button" class="btn btn-primary">
                            START
                        </button>
                    </div>
                    <div class="col">
                        <p>
                            <b>Start</b> a crawler execution.
                        </p>
                    </div>
                    <div class="col">
                        <p>
                            <b>Start</b> a crawler execution.<br>
                            Shows the configuration panel for a manual insertion
                            of the configuration data.
                        </p>
                    </div>
                </div>
                <hr id="config-hr">
                <div id="config" class="row">
                    <div class="col" align="center">
                        <h3>Configuration</h3>
                        <p>
                            <b>Please read before usage!</b>
                        </p>
                        <p>
                            This is the manual configuration panel.
                            Please input the list of directories separated by
                            <b>;</b> in the following way:
                            <br>
                            <i>directoryA, True ; directoryB, False</i>
                            <br>
                            This input will crawl <i>directoryA</i> recursively
                            and only files that are directly located in
                            <i>directoryB</i>.
                            The power level is an indicator for how many CPU
                            cores will be used. A higher number will use more
                            resources.
                            The work package size defines how many files
                            are combined in one work package for analysis.
                            Please provide a number between 10 and 1000 here.
                            If you want to stop a possible currently running
                            execution and run the new one, set the update value
                            to <i>Yes</i>, otherwise <i>No</i>.
                        </p>
                        <form id="config-form">
                            <div class="form-group row directories">
                                <label for="directories" class="col-sm-2 col-form-label">
                                    Directories
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="directories-data">
                                </div>
                            </div>
                            <div class="form-group row exiftool">
                                <label for="exiftool" class="col-sm-2 col-form-label">ExifTool</label>
                                <div class="col-sm-10">
                                    <select id="exiftool" class="form-control">
                                        <option selected value="Linux">Linux</option>
                                        <option value="Windows">Windows</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row powerlevel">
                                <label for="powerlevel" class="col-sm-2 col-form-label">Power level</label>
                                <div class="col-sm-10">
                                    <select id="powerlevel" class="form-control">
                                        <option selected value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row package-size">
                                <label for="package-size" class="col-sm-2 col-form-label">Package size</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="package-size">
                                </div>
                            </div>
                            <div class="form-group row update">
                                <label for="update" class="col-sm-2 col-form-label">Update</label>
                                <div class="col-sm-10">
                                    <select id="update" class="form-control">
                                        <option selected value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row">
                                <div class="col">
                                    <button type="submit" class="btn btn-primary">SUBMIT</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div id="messages" class="col" align="center">
                        <h3>Messages</h3>
                    </div>
                </div>
            </div>
        `;
    }

    onLoad() {
        $("#config").hide();
        $("#config-hr").hide();
        var self = this;
        $("#continue-button").click(function() {
            console.log("clicked");
            self.restAPIFetcherCrawler.fetchPost("continue", function (event) {
                console.log(event);
                self.renderMessage("success", "Hey was geht ab voll cool")
            });
        });

        $("#start-button").click(function() {
            $("#config").show();
            $("#config-hr").show();
        });

        $("#config-form").on("submit", function(e) {
            e.preventDefault();
            self.submitConfig();
        });
    }

    submitConfig() {
        alert("Submit form");
    }

    renderMessage(status, message) {
        var alertType = "";
        var title = "";
        if (status == "success") {
            alertType = "alert-success";
            title = "Success";
        } else if (status == "warning") {
            alertType = "alert-warning";
            title = "Warning";
        } else {
            alertType = "alert-danger";
            title = "Error";
        }
        $("#messages").append(`
            <div class="alert ${alertType} alert-dismissible fade show" role="alert">
                <h4 class="alert-heading">${title}!</h4>
                <hr>
                <p>${message}</p>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `)
    }


}

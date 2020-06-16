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
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark">Information</h2>
                        <p></p>
                        <p style="text-align: left;">
                            This is the panel for controlling the crawler.
                            The crawler has three states:
                            <b>ready</b>, <b>running</b> and <b>paused</b>.
                            All these actions are safe to use in all states,
                            but some may have no impact in a certain state.
                            For example, stopping the crawler when it was running
                            will stop the current execution, but stopping when
                            the crawler was ready will have no consequences.
                            Make sure to wait for the response if you invoked an
                            action. You'll see an alert message at the bottom
                            once the action has finished.
                            Especially starting the crawler might take some time
                            due to the generation of the work packages.
                        </p>
                    </div>
                </div>
                <hr>
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark">Actions</h2>
                    </div>
                </div>
                <div class="row mt-1 mb-1">
                    <div class="col-md-12 col-lg-8">
                        <p>
                            <b>Stop</b> the current execution.
                            If the crawler is ready, the action will be ignored.
                            Otherwise, the running/paused execution will be aborted.
                        </p>
                    </div>
                    <div class="col-md-12 col-lg-2">
                        <p></p>
                    </div>
                    <div class="col-md-12 col-lg-2 mb-5" align="center">
                        <button id="stop-button" type="button" class="btn btn-primary btn-block font-weight-bold">
                            STOP
                        </button>
                    </div>
                </div>
                <div class="row mt-1 mb-1">
                    <div class="col-md-12 col-lg-8">
                        <p>
                            <b>Pause</b> the current execution.
                            If the crawler is ready or already paused,
                            the action will be ignored.
                            Otherwise, it will pause the current exeution
                            so that it can be continued later on.
                        </p>
                    </div>
                    <div class="col-md-12 col-lg-2">
                        <p></p>
                    </div>
                    <div class="col-md-12 col-lg-2 mb-5" align="center">
                        <button id="pause-button" type="button" class="btn btn-primary btn-block font-weight-bold">
                            PAUSE
                        </button>
                    </div>
                </div>
                <div class="row mt-1 mb-1">
                    <div class="col-md-12 col-lg-8">
                        <p>
                            <b>Continue</b> a paused execution of the crawler.
                            If the crawler is ready or already running,
                            the action will be ignored.
                            Otherwise, it will continue the currently
                            paused execution.
                        </p>
                    </div>
                    <div class="col-md-12 col-lg-2">
                        <p></p>
                    </div>
                    <div class="col-md-12 col-lg-2 mb-5" align="center">
                        <button id="continue-button" type="button" class="btn btn-primary btn-block font-weight-bold">
                            CONTINUE
                        </button>
                    </div>
                </div>
                <div class="row mt-1 mb-1">
                    <div class="col-md-12 col-lg-8">
                        <p>
                            <b>Shutdown</b> the crawler entirely.
                            Stop a possible current execution and terminate
                            all crawler threads.
                        </p>
                    </div>
                    <div class="col-md-12 col-lg-2">
                        <p></p>
                    </div>
                    <div class="col-md-12 col-lg-2 mb-5" align="center">
                        <button id="shutdown-button" type="button" class="btn btn-primary btn-block font-weight-bold">
                            SHUTDOWN
                        </button>
                    </div>
                </div>
                <div class="row mt-1 mb-1">
                    <div class="col-md-12 col-lg-8">
                        <p>
                            <b>Start</b> a crawler execution.
                            Shows the configuration panel for a manual insertion
                            of the configuration data.
                        </p>
                    </div>
                    <div class="col-md-12 col-lg-2">
                        <p></p>
                    </div>
                    <div class="col-md-12 col-lg-2 mb-5" align="center">
                        <button id="start-button" type="button" class="btn btn-primary btn-block font-weight-bold">
                            START
                        </button>
                    </div>
                </div>
                <hr id="config-hr">
                <div id="config" class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark">Configuration</h2>
                        <p></p>
                        <p style="text-align: left">
                            <b>Please read before usage!</b>
                            This is the manual configuration panel.
                            Please input the list of directories separated by
                            <code>;</code> in the following way:
                        </p>
                        <p style="text-align: left">
                            <code>
                                directoryA, True ; directoryB, False
                            </code>
                        </p>
                        <p style="text-align: left">
                            This input will crawl <code>directoryA</code> recursively
                            and only files that are directly located in
                            <code>directoryB</code>.
                            The <b>power level</b>
                            is an indicator for how many CPU
                            cores will be used.
                            Setting this value to <code>4</code> will use all
                            available physical cores, the value <code>1</code>
                            will result in using about one quarter of the
                            available cores.
                            The <b>package size</b> defines how many files
                            are combined in one work package for analysis.
                            Please provide a number between <code>10</code>
                            and <code>1000</code> here.
                            A reliable default value is <code>250</code>.
                            If you want to stop a possible currently running
                            execution and run the new one, set the <b>update</b> value
                            to <code>Yes</code>, otherwise <code>No</code>.
                        </p>
                        <p></p>
                        <form id="config-form">
                            <div class="form-group row directories">
                                <label for="directories" class="col-sm-2 col-form-label">
                                    Directories
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="directories">
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
                            <div class="form-group row clear-trace">
                                <label for="exiftool" class="col-sm-2 col-form-label">Clear Trace</label>
                                <div class="col-sm-10">
                                    <select id="clear-trace" class="form-control">
                                        <option selected value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row update">
                                <label for="update" class="col-sm-2 col-form-label">Update</label>
                                <div class="col-sm-10">
                                    <select id="update" class="form-control">
                                        <option selected value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row">
                                <div class="col-12 col-md-4 pr-2 pl-2 pt-3">
                                    <button type="submit" class="btn btn-primary btn-block font-weight-bold">SUBMIT</button>
                                </div>
                                <div class="col-12 col-md-4 pr-2 pl-2 pt-3">
                                    <button type="reset" class="btn btn-primary btn-block font-weight-bold">CLEAR</button>
                                </div>
                                <div class="col-12 col-md-4 pr-2 pl-2 pt-3">
                                    <button type="reset" id="cancel-config" class="btn btn-primary btn-block font-weight-bold">CANCEL</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <hr>
                <div class="row mt-3 mb-3">
                    <div id="messages" class="col" align="center">
                        <p></p>
                    </div>
                </div>
            </div>
        `;
    }

    onLoad() {
        $("#config").hide();
        $("#config-hr").hide();
        // Register callback functions for action buttons
        var self = this;
        $("#continue-button").click(function() {
            self.runActionWithMessage("continue");
        });
        $("#pause-button").click(function() {
            self.runActionWithMessage("pause");
        });
        $("#stop-button").click(function() {
            self.runActionWithMessage("stop");
        });
        $("#shutdown-button").click(function() {
            self.runActionWithMessage("shutdown");
        });

        $("#start-button").click(function() {
            $("#config").show();
            $("#config-hr").show();
        });

        $("#cancel-config").click(function() {
            $("#config").hide();
            $("#config-hr").hide();
        });

        $("#config-form").on("submit", function(e) {
            e.preventDefault();
            self.submitConfig(e);
        });
    }

    runActionWithMessage(route) {
        let self = this;
        self.restAPIFetcherCrawler.fetchGet(route, function (event) {
            self.renderMessage(
                event.data.success, event.data.message, event.data.command
            );
            $('html, body').animate({
                scrollTop: $("#messages").offset().top
            }, "fast");
        });
    }

    submitConfig(event) {
        let directories = $("#directories").val();
        let exiftool = $("#exiftool").val();
        let powerLevel = $("#powerlevel").val();
        let packageSize = $("#package-size").val();
        let clearTrace = $("#clear-trace").val();
        let update = $("#update").val();
        let config = {
            "paths": {
                "inputs": [],
                "exiftool": ""
            },
            "options": {
                "clearTrace": "",
                "packageSize": "",
                "powerLevel": "",
            }
        };
        try {
            let splits = directories.split(";");
            splits.forEach(function(item) {
                let path = item.split(",")[0].trim();
                let recursive = item.split(",")[1].trim().toLowerCase();
                let recursive_flag = false;
                if (recursive === "true") {
                    recursive_flag = true;
                } else if (recursive === "false" ) {
                    recursive_flag = false;
                } else {
                    throw "Invalid recursive option";
                }
                config["paths"]["inputs"].push({
                    "path": path,
                    "recursive": recursive_flag
                });
            });
        } catch (err) {
            this.renderMessage(
                false,
                "Ooops, it seems like your input data was invalid :(",
                "config"
            );
            return;
        }
        config["paths"]["exiftool"] = exiftool;
        config["options"]["powerLevel"] = parseInt(powerLevel);
        config["options"]["packageSize"] = parseInt(packageSize);
        config["options"]["clearTrace"] = clearTrace === 'true';
        let url = `start?config=${JSON.stringify(config)}&update=${update}`;
        this.runActionWithMessage(url);
    }

    renderMessage(success, message, command) {
        let alertType = "";
        let title = "";
        let timestamp = new Date().toLocaleString();
        if (success) {
            alertType = "alert-success";
            title = "Success";
            message = "";
        } else {
            alertType = "alert-warning";
            title = "Warning";
        }
        $("#messages").append(`
            <div class="alert ${alertType} alert-dismissible fade show" role="alert">
                <h4 class="alert-heading">${title} @ ${command}</h4>
                <hr>
                <p>${message} Time was: ${timestamp} </p>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `);
    }


}

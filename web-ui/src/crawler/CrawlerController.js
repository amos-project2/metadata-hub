import {Page} from "../Page";
import {Message} from "./components/Message";
import {Config} from "./components/Config";

export class CrawlerController extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "";
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
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

        this.infoTimer = null;
        this.crawlerLastInfoState = "null";
        this.lastUserAction = "null";
        this.progressedWithoutCriticalUserInteraction=false;
        this.isSubmitted=false;

    }

    content() {
        // let thisData = this; //its unused TODO remove?
        return `
            <div class="container">
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark">Controller</h2>
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
                    <div class="col">
                        <h2 class="text-dark text-center">Status</h2>
                        <p class="text-center">
                            The crawler is currently
                            <span id="crawler-status"></span>
                            <span id="crawler-progress">.</span>

                            <div class="progress" style="height:25px">
                                <div class="progress-bar my-progress-bar " role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
                            </div>


                        <p>
                        <p class="text-left">
                            <pre><code id="config-value"></code></pre>
                        </p>
                    </div>
                </div>
                <hr>
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark">Actions</h2>
                    </div>
                </div>
                <div class="row mt-1 mb-1 cc-action-stop">
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
                <div class="row mt-1 mb-1 cc-action-pause">
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
                <div class="row mt-1 mb-1 cc-action-continue">
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
                <div class="row mt-1 mb-1 cc-action-shutdown">
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
                <div class="row mt-1 mb-1 cc-action-start">
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
                <div class="cc-action-start">
                    <div id="config" class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark">Configuration</h2>
                        <p></p>
                        <p style="text-align: left">
                            <b>Please read carefully before usage!</b>
                            This is the manual configuration panel that is used
                            to create new TreeWalk executions.
                            In the following, each input will be briefly
                            explained.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Name </span>
                            The name of the conifguration. It should be a short
                            name that describes the purpose of the configuration,
                            e.g. <code>My vacation pictures</code>.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Author </span>
                            The author of the conifguration, simply input your
                            name here, e.g. <code>John Doe</code>.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Description </span>
                            A more detailed description of the configuration that
                            explains its purpose.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Start </span>
                            Start timestamp of the configuration. It <b>must</b>
                            be according to the format
                            <code>'YEAR-MONTH-DAYS HOURS:MINUTES:SECONDS'</code>,
                            e.g. <code>'2020-07-22 10:15:00'</code>.
                            This is due the internal implementation of the TreeWalk.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Interval </span>
                            This defines the interval in which the configuration
                            is executed periodically. Input the number of hours
                            and days the in which the execution should be repeated.
                            If the configuration should only be executed once,
                            leave both values as <code>0</code>.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Directories </span>
                            Please input the list of directories separated by
                            <code>;</code> in the following way:
                            <code>directoryA, True ; directoryB, False ; ...</code>.
                            This input will crawl <code>directoryA</code> recursively
                            and only files that are directly located in
                            <code>directoryB</code>.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">CPU-Level </span>
                            This an indicator for how many CPU cores will be used.
                            Setting this value to <code>4</code> will use all
                            available physical cores, the value <code>1</code>
                            will result in using about one quarter of the
                            available cores.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Package-Size </span>
                            This setting defines how many files
                            are combined in one work package for analysis.
                            Please provide a number between <code>10</code>
                            and <code>1000</code> here.
                            A reliable default value is <code>100</code>.
                        </p>
                        <p class="text-left">
                            <span class="font-weight-bold">Force-Update </span>
                            If you want to stop a possible currently running
                            execution and run the new one, set the value
                            to <code>Yes</code>, otherwise <code>No</code>.
                        </p>
                        <p></p>
                        <form id="config-form">
                            <div class="form-group row name">
                                <label for="name" class="config-input-label">
                                    Name
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="name">
                                </div>
                            </div>
                            <div class="form-group row author">
                                <label for="author" class="config-input-label">
                                    Author
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="author">
                                </div>
                            </div>
                            <div class="form-group row description">
                                <label for="description" class="config-input-label">
                                    Description
                                </label>
                                <div class="col-sm-10">
                                    <textarea type="text" class="form-control" id="description" rows="3"></textarea>
                                </div>
                            </div>
                            <div class="form-group row time-start">
                                <label for="time-start" class="config-input-label">
                                    Start
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="time-start">
                                </div>
                            </div>

                            <div class="form-group row time-interval">
                                <label for="time-interval" class="config-input-label">
                                    Interval
                                </label>
                                <div class="col-sm-10">
                                    <input type="range" id="time-interval-hours" min="0" value="0" max="23" style="margin-right: 10%">
                                    <input type="range" id="time-interval-days" min="0" value="0" max="31">
                                    <p>
                                        <span id="time-interval-hours-value">0</span>
                                        <span> hours ; </span>
                                        <span id="time-interval-days-value">0</span>
                                        <span> days</span>

                                    </p>
                                </div>
                            </div>
                            <div class="form-group row directories">
                                <label for="directories" class="config-input-label">
                                    Directories
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="directories">
                                </div>
                            </div>
                            <div class="form-group row platform">
                                <label for="platform" class="config-input-label">
                                    Platform
                                </label>
                                <div class="col-sm-10">
                                    <select id="platform" class="form-control">
                                        <option selected value="Linux">Linux</option>
                                        <option value="Windows">Windows</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row cpu-level">
                                <label for="powerlevel" class="config-input-label">
                                    CPU-Level
                                </label>
                                <div class="col-sm-10">
                                    <select id="cpu-level" class="form-control">
                                        <option selected value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group row package-size">
                                <label for="package-size" class="config-input-label">
                                    Package-Size
                                </label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" id="package-size">
                                </div>
                            </div>
                            <div class="form-group row force-update">
                                <label for="update" class="config-input-label">
                                    Force-Update
                                </label>
                                <div class="col-sm-10">
                                    <select id="force-update" class="form-control">
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
                                    <button id="clear-config" type="reset" class="btn btn-primary btn-block font-weight-bold">CLEAR</button>
                                </div>
                                <div class="col-12 col-md-4 pr-2 pl-2 pt-3">
                                    <button type="reset" id="cancel-config" class="btn btn-primary btn-block font-weight-bold">CANCEL</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
                <hr>
                <div class="row mt-3 mb-3">
                    <div id="messages" class="col">
                        <p></p>
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentTimestampLocalTime() {
        let currentTime = new Date();
        let offset = currentTime.getTimezoneOffset() * 60000;
        let local = new Date(currentTime - offset);
        return local.toISOString().slice(0, 19).replace('T', ' ');
    }

    updateStatus() {
        let thisdata = this;
        this.restAPIFetcherCrawler.fetchGet("info", function (event) {
            let crawlerStatus = $("#crawler-status");
            let crawlerProgress = $("#crawler-progress");
            let crawlerProgressBar= $(".my-progress-bar");
            let crawlerConfig = $("#config-value");
            if (event.status !== 1) {
                crawlerStatus.removeClass();
                crawlerStatus.addClass("font-weight-bold");
                crawlerStatus.addClass("text-secondary");
                crawlerProgress.html("");
                crawlerConfig.html("");
                crawlerProgressBar.css('width', `${0}%`);
                crawlerProgressBar.html(`${0}%`);
                crawlerStatus.html("NOT AVAILABLE");
                thisdata.updateControllerElements("unavailable");
                return;
            }
            let status = event.data.message.status.toUpperCase();
            thisdata.updateControllerElements(event.data.message.status);
            thisdata.update100PercentProgressBar(event.data.message.status);
            crawlerStatus.removeClass();
            crawlerStatus.addClass("font-weight-bold");
            crawlerStatus.html(`${status}`);
            if (status === "READY") {
                crawlerStatus.addClass("text-success");
                crawlerProgress.html("");
                crawlerConfig.html("");

                //this override the 100% i want to show at the end of an successfull progress
                crawlerProgressBar.css('width', `${0}%`);
                crawlerProgressBar.html(`${0}%`);
                return;
            }
            let progress = event.data.message.progress;
            thisdata.progressedWithoutCriticalUserInteraction=true;
            crawlerProgress.html(`. Progress is ${progress} %.`);
            crawlerProgressBar.css('width', `${progress}%`);
            crawlerProgressBar.html(`${progress}%`);
            console.log(event.data.message.config);
            crawlerConfig.html(JSON.stringify(event.data.message.config, undefined, 4));
            if (status === "PAUSED") {
                crawlerStatus.addClass("text-info");
            } else {
                crawlerStatus.addClass("text-warning");
            }
        });
    }

    update100PercentProgressBar(crawlerState) {
        if(this.isSubmitted && crawlerState==="ready"){
            let crawlerProgressBar= $(".my-progress-bar");
            crawlerProgressBar.css('width', `100%`);
            crawlerProgressBar.html(`100%`);
        }

        //TODO fix it

        // if (crawlerState === "ready" && (this.progressedWithoutCriticalUserInteraction)) {
        //
        //     let crawlerProgressBar= $(".my-progress-bar");
        //     crawlerProgressBar.css('width', `100%`);
        //     crawlerProgressBar.html(`100%`);
        // }



        this.isSubmitted=false;



    }

    updateControllerElements(crawlerState) {
        if (crawlerState === this.crawlerLastInfoState) {return;}//no ui-change

        let stop = $(".cc-action-stop");
        let pause = $(".cc-action-pause");
        let continuex = $(".cc-action-continue");
        let shutdown =$(".cc-action-shutdown"); // it's always visible
        let start = $(".cc-action-start"); // it's always visible

        //the stop-method is an amition-stop

        switch (crawlerState) {
            case "ready":
                stop.stop(true).hide(1000);
                pause.stop(true).hide(1000);
                continuex.stop(true).hide(1000);
                start.stop(true).show(1000);
                shutdown.stop(true).show(1000);
                break;
            case "paused":
                stop.stop(true).show(1000);
                pause.stop(true).hide(1000);
                continuex.stop(true).show(1000);
                start.stop(true).show(1000);
                shutdown.stop(true).show(1000);
                break;
            case "running":
                stop.stop(true).show(1000);
                pause.stop(true).show(1000);
                continuex.stop(true).hide(1000);
                start.stop(true).show(1000);
                shutdown.stop(true).show(1000);
                break;
            case "unavailable":
                stop.stop(true).hide(1000);
                pause.stop(true).hide(1000);
                continuex.stop(true).hide(1000);
                start.stop(true).hide(1000);
                shutdown.stop(true).hide(1000);
                break;
            default:
                //i hope dont getting in there here
                stop.stop(true).show(1000);
                pause.stop(true).show(1000);
                continuex.stop(true).show(1000);
                start.stop(true).show(1000);
                shutdown.stop(true).show(1000);
                break;
        }

        this.crawlerLastInfoState = crawlerState;
    }


    //its called one time, after the page is the first time visited
    //cause we dont remove the page to no time from the dome, the listener dont needs to be re-added
    onMount() {
        // Register callback functions for action buttons
        let self = this;

        let stop = $(".cc-action-stop");
        let pause = $(".cc-action-pause");
        let continuex = $(".cc-action-continue");
        //let shutdown =$(".cc-action-shutdown"); //its always visible
        let start = $(".cc-action-start");

        stop.hide();
        pause.hide();
        continuex.hide();
        //shutdown.hide();
        start.hide();

        $("#config").hide();
        $("#config-hr").hide();


        $("#continue-button").click(function () {
            self.lastUserAction = "continue";
            self.runActionWithMessage("continue");
            self.progressedWithoutCriticalUserInteraction=true;
        });
        $("#pause-button").click(function () {
            self.lastUserAction = "pause";
            self.runActionWithMessage("pause");
            self.progressedWithoutCriticalUserInteraction=false;
        });
        $("#stop-button").click(function () {
            self.lastUserAction = "stop";
            self.runActionWithMessage("stop");
            self.progressedWithoutCriticalUserInteraction=false;
        });
        $("#shutdown-button").click(function () {
            self.lastUserAction = "shutdown";
            self.runActionWithMessage("shutdown");
            self.progressedWithoutCriticalUserInteraction=false;
        });

        $("#start-button").click(function () {
            $("#config").show(200);
            $("#config-hr").show(200);
            $("#author").val(localStorage.getItem("username"));
            $("#package-size").val(100);
            $("#time-start").val(self.getCurrentTimestampLocalTime());
            self.progressedWithoutCriticalUserInteraction=false;
        });

        $("#cancel-config").click(function () {
            $("#config").hide(500);
            $("#config-hr").hide(500);
            $('#time-interval-hours-value').html("0");
            $('#time-interval-days-value').html("0");
        });

        $("#clear-config").click(function () {
            $('#time-interval-hours-value').html("0");
            $('#time-interval-days-value').html("0");
        });

        $('#time-interval-hours').on('input', function () {
            $('#time-interval-hours-value').html(this.value);
        });

        $('#time-interval-days').on('input', function () {
            $('#time-interval-days-value').html(this.value);
        });

        $("#config-form").on("submit", function (e) {
            e.preventDefault();
            self.submitConfig(e);
        });
    }

    //this method is called each time the user open/go-back to the page here
    onLoad() {
        let self = this;
        self.updateStatus();
        this.infoTimer = setInterval(function () {
            self.updateStatus()
        }, 2000);
    }

    //this method is called each time the user leave the page
    onUnLoad() {
        clearInterval(this.infoTimer);
    }


    showMessage(message) {
        let messages = $("#messages");
        messages.append(message.render()).hide().fadeIn(1000);
        $('html, body').animate({
            scrollTop: messages.offset().top
        }, 1000);
    }

    runActionWithMessage(route, callback) {
        let self = this;
        let messages = $("#messages");
        self.restAPIFetcherCrawler.fetchGet(route, function (event) {
            self.updateStatus();
            let message = new Message(event.data);
            self.showMessage(message);
            callback(event);
        });
    }

    submitConfig(event) {
        let name = $("#name").val();
        let author = $("#author").val();
        let description = $("#description").val();
        let start = $("#time-start").val();
        let intervalHours = $("#time-interval-hours").val();
        let intervalDays = $("#time-interval-days").val();
        let directories = $("#directories").val();
        let platform = $("#platform").val();
        let cpuLevel = $("#cpu-level").val();
        let packageSize = $("#package-size").val();
        let forceUpdate = $("#force-update").val();
        let config = new Config(
            name, author, description, start, intervalHours, intervalDays,
            directories, platform, cpuLevel, packageSize, forceUpdate
        )
        let data = config.parse()
        if (data === null) {
            data = {
                "success": false,
                "message": "Ooops, it seems like your input directories were invalid :(",
                "command": "config"
            }
            this.showMessage(new Message(data));
        } else {
            let url = `start?config=${JSON.stringify(data)}`;
            //we hide directly
            $("#config").hide(500);
            $("#config-hr").hide(500);
            let crawlerProgressBar= $(".my-progress-bar");
            crawlerProgressBar.css('width', `0%`);
            crawlerProgressBar.html(`0%`);
            let self = this;
            this.runActionWithMessage(url, function (event) {
                if (!event.data.success) {
                    //if there is an error in the api-request, then we show it again
                    $("#config").stop(true).show(200);
                    $("#config-hr").stop(true).show(200);
                } else {
                    self.isSubmitted=true;
                }
            });
        }
    }

}

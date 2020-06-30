import {Page} from "../Page";
import {Message} from "./components/Message";
import {Config} from "./components/Config";
import {Descriptions} from "./components/Descriptions";

import {Action} from "./components/Action";

export class CrawlerController extends Page {
    constructor(parent, identifier, mountpoint, titleSelector) {
        // Page
        super(parent, identifier, mountpoint, titleSelector);
        this.title = "Crawler Controller";
        this.titleActive = false;
        this.restAPIFetcherCrawler = this.parent.dependencies.restApiFetcherCrawler;
        this.cacheLevel = 3;
        // Timers and Infos
        this.infoTimer = null;
        this.crawlerLastInfoState = "null";
        this.lastUserAction = "null";
        this.progressedWithoutCriticalUserInteraction = false;
        this.isSubmitted = false;
        // Actions
        this.actionStop = "cc-action-stop";
        this.actionPause = "cc-action-pause";
        this.actionContinue = "cc-action-continue";
        this.actionShutdown = "cc-action-shutdown";
        this.actionStart = "cc-action-start";
    }

    content() {
        return `
            <div class="container">
                <div class="row mt-3 mb-3">
                    <div class="col" align="center">
                        <h2 class="text-dark mb-3">Controller</h2>
                        <p class="text-left">${Descriptions.controllerInfo()}</p>
                    </div>
                </div>
                <hr>
                <div class="row mt-3 mb-3">
                    <div class="col">
                        <div class="text-center mb-3">
                            <h2 id="crawler-status"></h2>
                        </div>
                        <div class="progress">
                            <div
                                class="progress-bar my-progress-bar"
                                role="progressbar"
                                style="width: 0%; color: red" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                            >
                            </div>
                        </div>
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
                ${new Action(
                    this.actionStop, Descriptions.actionStop(), "stop"
                ).render()}
                ${new Action(
                    this.actionPause, Descriptions.actionPause(), "pause"
                ).render()}
                ${new Action(
                    this.actionContinue, Descriptions.actionContinue(), "continue"
                ).render()}
                ${new Action(
                    this.actionShutdown, Descriptions.actionShutdown(), "shutdown"
                ).render()}
                ${new Action(
                    this.actionStart, Descriptions.actionStart(), "start"
                ).render()}
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
                        ${Descriptions.configurationName()}
                        ${Descriptions.configurationAuthor()}
                        ${Descriptions.configurationDescription()}
                        ${Descriptions.configurationStart()}
                        ${Descriptions.configurationInterval()}
                        ${Descriptions.configurationDirectories()}
                        ${Descriptions.configurationCPULevel()}
                        ${Descriptions.configurationPackageSize()}
                        ${Descriptions.configurationForceUpdate()}
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
                                    <input type="text" class="form-control" id="author" value="${localStorage.getItem("username")}" disabled>
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
                                        <label for="time-start-select" class="config-input-label">
                                            Start
                                        </label>
                                        <div class="col-sm-10 time-select-container">
                                            <select class="custom-select" id="time-start-select">
                                                <option selected value="now">Start Now</option>
                                                <option value="later">Start Later (Scheduled)</option>
                                            </select>
                                        </div>
                                        <div class="col-sm-6 time-start-container" style="display:none;">
<!--                                        <input type="text" class="form-control fg-metadata-attribute" placeholder="Metadata-Attribute">-->
                                        <input type="datetime-local" class="form-control " id="time-start">
                                        </div>



<!--                                <label for="time-start" class="config-input-label">-->
<!--                                    Start-->
<!--                                </label>-->
<!--                                <div class="col-sm-10">-->
<!--                                    <input type="text" class="form-control" id="time-start">-->
<!--                                </div>-->


                            </div>

                            <div class="form-group row time-interval">
                                <label for="time-interval" class="config-input-label">
                                    Interval
                                </label>
                                <div class="col-sm-5">
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="time-interval-days"
                                        min="0"
                                        max="31"
                                        placeholder="Days"
                                    >
                                </div>
                                <div class="col-sm-5">
                                    <input
                                        type="number"
                                        class="form-control"
                                        id="time-interval-hours"
                                        min="0"
                                        max="23"
                                        placeholder="Hours"
                                    >
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
                                    <input type="number" class="form-control" id="package-size" value="100" max="100" min="10" >
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
                    <div id="messages-controller" class="col">
                        <p></p>
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentTimestampLocalTime() {
        return this.convertTime(new Date());
    }

    convertTime(timeValue) {
        try {
            let currentTime = new Date(timeValue);
            let offset = currentTime.getTimezoneOffset() * 60000;
            let local = new Date(currentTime - offset);
            return local.toISOString().slice(0, 19).replace('T', ' ');
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    updateStatus() {
        let thisdata = this;
        this.restAPIFetcherCrawler.fetchGet("info", function (event) {
            let crawlerStatus = $("#crawler-status");
            let crawlerProgressBar = $(".my-progress-bar");
            let crawlerConfig = $("#config-value");
            if (event.status !== 1) {
                crawlerStatus.removeClass();
                crawlerStatus.addClass("text-center");
                crawlerStatus.addClass("font-weight-bold");
                crawlerStatus.addClass("text-secondary");
                crawlerConfig.html("");
                crawlerProgressBar.css('width', `${0}%`);
                crawlerStatus.html("NOT AVAILABLE");
                thisdata.updateControllerElements("unavailable");
                return;
            }
            let status = event.data.message.status.toUpperCase();
            thisdata.updateControllerElements(event.data.message.status);
            thisdata.update100PercentProgressBar(event.data.message.status);
            crawlerStatus.removeClass();
            crawlerStatus.addClass("text-center");
            crawlerStatus.addClass("font-weight-bold");
            crawlerStatus.html(`${status}`);
            if (status === "READY") {
                crawlerStatus.addClass("text-success");
                crawlerConfig.html("");
                //this override the 100% i want to show at the end of an successfull progress
                crawlerProgressBar.css('width', `${0}%`);
                return;
            }
            let progress = parseFloat(event.data.message.progress).toFixed(2);
            thisdata.progressedWithoutCriticalUserInteraction = true;
            crawlerProgressBar.css('width', `${progress}%`);
            console.log(event.data.message);
            crawlerConfig.html(JSON.stringify({
                "progress": `${progress}%`,
                "processes": event.data.message.processes,
                "config": event.data.message.config
            }, undefined, 4));
            if (status === "PAUSED") {
                crawlerStatus.addClass("text-info");
            } else {
                crawlerStatus.addClass("text-warning");
            }
        });
    }

    update100PercentProgressBar(crawlerState) {
        if (this.isSubmitted && crawlerState === "ready") {
            let crawlerProgressBar = $(".my-progress-bar");
            crawlerProgressBar.css('width', `100%`);
        }
        this.isSubmitted = false;
    }

    updateControllerElements(crawlerState) {
        if (crawlerState === this.crawlerLastInfoState) {return;} // no ui-change
        let stop = $(`.${this.actionStop}`);
        let pause = $(`.${this.actionPause}`);
        let continuex = $(`.${this.actionContinue}`);
        let shutdown = $(`.${this.actionShutdown}`); // always visible
        let start = $(`.${this.actionStart}`); // always visible
        // the stop-method is an animation-stop
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
                // I hope dont getting in there here
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
        let stop = $(`.${this.actionStop}`);
        let pause = $(`.${this.actionPause}`);
        let continuex = $(`.${this.actionContinue}`);
        let start = $(`.${this.actionStart}`);
        stop.hide();
        pause.hide();
        continuex.hide();
        start.hide();
        $("#config").hide();
        $("#config-hr").hide();

        $(`#${this.actionContinue}-button`).click(function () {
            self.lastUserAction = "continue";
            self.runActionWithMessage("continue");
            self.progressedWithoutCriticalUserInteraction = true;
        });
        $(`#${this.actionPause}-button`).click(function () {
            self.lastUserAction = "pause";
            self.runActionWithMessage("pause");
            self.progressedWithoutCriticalUserInteraction = false;
        });
        $(`#${this.actionStop}-button`).click(function () {
            self.lastUserAction = "stop";
            self.runActionWithMessage("stop");
            self.progressedWithoutCriticalUserInteraction = false;
        });
        $(`#${this.actionShutdown}-button`).click(function () {
            self.lastUserAction = "shutdown";
            self.runActionWithMessage("shutdown");
            self.progressedWithoutCriticalUserInteraction = false;
        });
        $(`#${this.actionStart}-button`).click(function () {
            $("#config").show(200);
            $("#config-hr").show(200);
            $("#package-size").val(100);
            self.progressedWithoutCriticalUserInteraction = false;
        });

        $("#cancel-config").click(function () {
            $("#config").hide(500);
            $("#config-hr").hide(500);
        });

        $("#config-form").on("submit", function (e) {
            e.preventDefault();
            self.submitConfig(e);
        });

        $("#time-start-select").change(function () {
            if ($(this).val() === "now") {
                $(".time-select-container").addClass("col-sm-10");
                $(".time-select-container").removeClass("col-sm-4");
                $(".time-start-container").hide();
            } else {
                $(".time-select-container").addClass("col-sm-4");
                $(".time-select-container").removeClass("col-sm-10");
                $(".time-start-container").show();
            }
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
        let messages = $("#messages-controller");
        messages.append(message.render());//.hide().fadeIn(1000);
        message.fadeIn();
        $('html, body').animate({
            scrollTop: messages.offset().top
        }, 1000);
    }

    runActionWithMessage(route, callback) {
        let self = this;
       // let messages = $("#messages-controller");
        self.restAPIFetcherCrawler.fetchGet(route, function (event) {
            self.updateStatus();
            let message = new Message(event.data);
            self.showMessage(message);
            callback(event);
        });
    }

    submitConfig(event) {
        let name = $("#name").val();
        let author = localStorage.getItem("username"); //$("#author").val();
        let description = $("#description").val();
        let start;

        if ($("#time-start-select").val() === "now") {
            start = this.getCurrentTimestampLocalTime();
        } else {

            let timeInputValue = $("#time-start").val();
            start = this.convertTime(timeInputValue);
            if (start === null) {

                let data = {
                    "success": false,
                    "message": "You selected the option <b>Start Scheduled</b>. Please insert a valid DateTime",
                    "command": "config"
                };
                this.showMessage(new Message(data));
                return;

            }


        }

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
            let crawlerProgressBar = $(".my-progress-bar");
            crawlerProgressBar.css('width', `0%`);
            let self = this;
            this.runActionWithMessage(url, function (event) {
                if (!event.data.success) {
                    //if there is an error in the api-request, then we show it again
                    $("#config").stop(true).show(200);
                    $("#config-hr").stop(true).show(200);
                } else {
                    self.isSubmitted = true;
                }
            });
        }
    }

}

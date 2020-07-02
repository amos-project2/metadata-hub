/* Scheduled executions of the Crawler in the Schedule tab.

Each task displays information about its corresponding execution, such as
next/periodic execution time, config values, etc.
*/

export class Task {

    constructor(task) {
        // Already set properties
        this.identifier = task.identifier;
        this.pending = task.pending;
        this.force = task.force;
        this.interval = task.interval;
        this.name = task.config.name;
        this.author = task.config.author;
        this.description = task.config.description;
        this.nextExecution = task.timestamp;
        this.config = task.config;
        // Properties to compute
        this.badgeStatus = "";
        this.badgeForce = "";
        this.badgePeriodic = "";
        this.periodicExecution = "";
        this.setBadgeStatus(this.pending);
        this.setBadgeForce(this.force);
        this.setBadgePeriodic(this.interval);
        this.renderPeriodicExecution();
        // Buttons and callbacks
        this.idElement = `task-${this.identifier}`;
        this.idConfig = `config-${this.identifier}`;
        this.idButtonConfig = `button-config-${this.identifier}`;
        this.idButtonRemove = `button-remove-${this.identifier}`;
        // FIXME
    }

    static getClassButtonRemove() {
        return 'button-remove-task';
    }

    setBadgeStatus(pending) {
        if (pending) {
            this.badgeStatus = `<span class="badge badge-warning mr-2">PENDING</span>`;
        } else {
            this.badgeStatus = `<span class="badge badge-info mr-2">WAITING</span>`;
        }
    }

    setBadgeForce(force) {
        if (force) {
            this.badgeForce = `<span class="badge badge-danger mr-2">FORCE</span>`;
        }
    }

    setBadgePeriodic(interval) {
        if (interval) {
            this.badgePeriodic = `<span class="badge badge-dark">PERIODIC</span>`;
        }
    }

    renderPeriodicExecution() {
        if (!this.interval) {
            this.periodicExecution = "";
            return;
        }
        let totalSeconds = this.interval;
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds -= days * 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds -= hours * 3600;
        let minutes = Math.floor(totalSeconds / 60);
        totalSeconds -= minutes * 60;
        let seconds = totalSeconds;
        this.periodicExecution = `
            <p class="card-text">
                Repeats every:
                <code>
                    ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds
                </code>
            </p>
        `;
    }

    addListeners() {
        let self = this;
        $(`#${this.idButtonConfig}`).click(function() {
            $(`#${self.idConfig}`).toggle(1000, "swing");
        });
    }

    render() {
        return `
            <div class="card mt-3" id=${this.idElement}>
                <div class="card-header">
                    <div class="row">
                        <div class="col-md-12 col-xl-9">
                            <h5>
                                ${this.name}
                            </h5>
                        </div>
                        <div class="col-md-12 col-xl-3">
                            ${this.badgeStatus}
                            ${this.badgeForce}
                            ${this.badgePeriodic}
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <h6 class="card-title text-secondary">
                        ${this.author}
                    </h6>
                    <p class="card-text">
                        ${this.description}
                    </p>
                    <p class="card-text">
                        The next execution is scheduled at: <code>${this.nextExecution}</code>
                    </p>
                    ${this.periodicExecution}
                </div>
                <div id=${this.idConfig} class="card-body" style="display: none;">
                    <pre>${JSON.stringify(this.config, null, 4)}</pre>
                </div>
                <div class="card-body">
                    <button id=${this.idButtonConfig} class="btn btn-info mr-3">
                        CONFIG
                    </button>
                    <button
                        data-identifier=${this.identifier}
                        id=${this.idButtonRemove}
                        class="${Task.getClassButtonRemove()} btn btn-danger"
                    >
                        REMOVE
                    </button>
                </div>
            </div>
        `;
    }

}

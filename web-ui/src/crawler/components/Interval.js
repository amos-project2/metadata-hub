/* Type definition of an Interval.*/


export class Interval {

    constructor(interval) {
        // Already set properties
        this.start = interval.start;
        this.end = interval.end;
        this.cpu = interval["cpu-level"];
        this.identifier = interval.identifier;
        this.active = interval.active;
        // Properties to compute
        this.badgeActive = null;
        this.setBadgeActive();
        // Buttons and callbacks
        this.idElement = `task-${this.identifier}`;
        this.idButtonRemove = `button-remove-${this.identifier}`;
    }

    static getClassButtonRemove() {
        return 'button-remove-interval';
    }

    static renderCardItem(label, value, code) {
        value = (code) ? `<code>${value}</code>` : value;
        return `
            <div class="row mb-2">
                <div class="col-sm-6 col-lg-4">
                    <span class="font-weight-bold text-muted">${label}</span>
                </div>
                <div class="col-sm-6 col-lg-8">
                    ${value}
                </div>
            </div>
        `;
    }

    setBadgeActive() {
        if (this.active) {
            this.badgeActive = `<span class="badge badge-success mr-2">ACTIVE</span>`;
        } else {
            this.badgeActive = `<span class="badge badge-secondary mr-2">WAITING</span>`;
        }
    }

    render() {
        return `
            <div class="card mt-3" id=${this.idElement}>
                <div class="card-body">
                    <div class="row">
                        <div class="col-sm-12 col-md-6">
                            ${Interval.renderCardItem("Status", this.badgeActive, false)}
                            ${Interval.renderCardItem("Start", this.start, true)}
                            ${Interval.renderCardItem("End", this.end, true)}
                            ${Interval.renderCardItem("CPU", this.cpu, true)}
                        </div>
                        <div class="col-sm-12 col-md-6" align="right">
                            <button
                                data-identifier=${this.identifier}
                                id=${this.idButtonRemove}
                                class="${Interval.getClassButtonRemove()} btn btn-danger"
                            >
                                <span class="font-weight-bold">
                                    REMOVE
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

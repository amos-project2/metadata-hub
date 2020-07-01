/* Messages to display successful/failed actions to the user.

These messages are based on bootstrap alert types and are dismissible.
*/

export class Message {

    //race possible, but it is not so important here
    static increaseCount() {
        this.count = this.getCount() + 1;
        return this.count;
    }

    static getCount() {
        return this.count || 0;
    }


    constructor(response) {
        this.success = response.success;
        this.message = response.message;
        this.command = response.command;
        this.time = new Date().toLocaleString();
        this.alert = (this.success) ? "alert-success" : "alert-danger";
        this.status = (this.success) ? "Success" : "Failed";
        this.id="message-"+Message.increaseCount();
    }

    render() {
        return `
            <div class="alert ${this.alert} alert-dismissible fade show ${this.id}" role="alert" style="display:none;">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <p><strong>Message </strong>${this.message}</p>
                <p><strong>Info </strong> Time: ${this.time} , Command: ${this.command}</p>
            </div>
        `;
    }

    fadeIn(time) {
        if (time === undefined) {
            time=1000;
        }
        $("." + this.id).fadeIn(time);

    }

}

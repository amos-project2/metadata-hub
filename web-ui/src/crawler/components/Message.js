/* Messages to display successful/failed actions to the user.

These messages are based on bootstrap alert types and are dismissible.
*/

export class Message {

    constructor(response) {
        this.success = response.success;
        this.message = response.message;
        this.command = response.command;
        this.time = new Date().toLocaleString();
        this.alert = (this.success) ? "alert-success" : "alert-danger";
        this.status = (this.success) ? "Success" : "Failed";
    }

    render() {
        return `
            <div class="alert ${this.alert} alert-dismissible fade show" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <p><strong>Message </strong>${this.message}</p>
                <p><strong>Info </strong> Time: ${this.time} , Command: ${this.command}</p>
            </div>
        `;
    }

}

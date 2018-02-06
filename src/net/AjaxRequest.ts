export default class AjaxRequest {
    public requestName:string;
    public params:Object;
    protected _callback:(ok:boolean, details:Object)=>void;

    private _sending:boolean = false;

    constructor(requestName:string, params:Object, callback:(ok:boolean, details:Object)=>void) {
        this.requestName = requestName;
        this.params = params;
        this._callback = callback;
    }

    public send() {
        if (this._sending) return;
        this._sending = true;

        $.post("http://localhost:8000/dungeon/" + this.requestName, {"params": JSON.stringify(this.params)}).done((data) => {
            if (typeof data === "string") {
                try {
                    data = JSON.stringify(data);
                } catch(e) {
                    console.error(e);
                }
            }

            this._callback(true, data);
        }).fail(()=>{
            this._callback(false, null);
        });
    }
}
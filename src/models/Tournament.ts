import mongoose from "mongoose";
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const Tournament = new Schema({
    name: { type: String, required: true },
    stage: { type: String, required: true, default: "sign-up" }, // "sign-up" "draw" "play" "finished"
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    startDate: { 
        type: Date,
        required: true,
        default: () => new Date(),
        immutable: true
    },
    showMobile: { type: Boolean, required: true },
});

Tournament.virtual("startDateFormatted").get(function() {
    return DateTime.fromJSDate(this.startDate).toLocaleString(DateTime.DATE_MED);
});

Tournament.set('toJSON', { virtuals: true });

export default mongoose.models.Tournament || mongoose.model("Tournament", Tournament);

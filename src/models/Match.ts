import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { DateTime } from "luxon";

// This allows us to put either a Team _id or a Player _id.
// But, we need to define the ref through the participantModel
const ParticipantSchema = new Schema({
    participantId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'participants.participantModel'
    },
    participantModel: {
        type: String,
        required: true,
        enum: ["Player", "Team"]
    },
    resultText: { type: String, default: "" },
    isWinner: { type: Boolean, required: true, default: false },
    status: { type: String, default: null },
    name: { type: String, required: true }
});

const Match = new Schema({
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    nextMatchId: { type: Schema.Types.ObjectId, ref: "Match", default: null }, 
    previousMatchId: [{ type: Schema.Types.ObjectId, ref: "Match" }], 
    tournamentRoundText: { type: String, required: true }, 
    state: { type: String, required: true, default: "SCHEDULED" }, // SCHEDULED' | 'NO_SHOW' | 'WALK_OVER' | 'NO_PARTY' | 'DONE' | 'SCORE_DONE' Only needed to decide walkovers and if teamNames are TBD (to be decided)
    participants: [ParticipantSchema], 
    date: { type: Date, default: null },
    updateNumber: { type: Number, required: true, default: 0 },
    qualifyingMatch: { type: Boolean } 
});

Match.virtual("deadline").get(function() {
    if (!this.date) return null;
  	return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

Match.set('toJSON', { virtuals: true });

export default mongoose.models.Match || mongoose.model("Match", Match);

/*
Note, to create Matches we need to state the participant type:

const match = new Match({
  tournament: someTournamentId,
  // ...
  participants: [
    {
      participantId: player1Id,
      participantModel: "Player"
    },
    {
      participantId: player2Id,
      participantModel: "Player"
    }
  ]
});

await match.save();
*/

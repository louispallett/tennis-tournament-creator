/* =============================================================================================================
 * generateMatches.ts
 * -------------------------------------------------------------------------------------------------------------
 * This file exports one function:
 *      generateMatches(participants:string[]):MatchTypeLite[]
 * The participants argument must be the array of player _ids in this category ordered by RANKING.
 *
 * The aim of this function is to produce a flat array of match objects which contain the correct number of 
 * matches with the correct nextMatchIds. Each match should have exactly one nextMatchId, except for the final,
 * whose nextMatchId is null. This is very similar to a binary tree, but in reverse. In the case of 8 players, 
 * we want the matches to look like this:
 *
 * 
 *  QF ---v
 *        SF ----
 *  QF ---^     v 
 *              Final
 *  QF ---v     ^
 *        SF ----
 *  QF ---^
 *
 * --- Assigning Players ---
 *  >Case: players.length is a power of 2<
 *  If players is a power of 2 (2, 4, 8, 16, 32, 64, etc.), this is incredibly easy. First, we need to split our 
 *  match array into a multidimensional array of four matches each - we do this through the splitIntoFours() 
 *  function:
 *   [number denotes array.length]
 *   [4] => [[4]]
 *   [8] => [[4], [4]]
 *   [16] =>[[4], [4], [4], [4]]
 *   ... and so on
 *  We then run the result through reorderArray() - this selects matches based on the order array of indexes:
 *  [0, 3, 2, 1] - so:
 *   [1a, 1b, 1c, 1d] [2a, 2b, 2c, 2d]
 *   becomes...
 *   [1a, 2a, 1d, 2d, 1c, 2c, 1b, 2b]
 *  Note, if only a single array exists in this multidimensional array, this array is just flattened and returned.
 *
 *  The order of these matches in the result of reorderArray() denotes to the order we can add participants 
 *  sequentially (in order to ensure top-ranking players cannot play each other until the end)
 *  
 *  So, we just remove the top and bottom player from our player array and add them to the matches 
 *  in order.
 *  
 *  //! Note, this final step is actually different because this function is universal for all player.length values.
 *  //! However, if we were ONLY working with ^2 players, this is how we could do it.
 *  
 *  Now, we just return the arrays flattened()!
 *
 *  >Case: players.length is NOT a power of 2<
 *  It is far more likely that the number of players will not be a power of two. For each player over the nearest 
 *  ^2 (floored), we add one qualifying match. So, if there are 9 players, that's one qualifying match. Qualifying 
 *  matches must ALWAYS have two players in them, since there are no preceeding matches.
 *
 *  This case works the same in generateMatches() up until the second for loop.
 *
 *  //? NOTE: We need to account for both a single qualifying match scenario (where the number of qualifying matches
 *  //? is no more than the number of matches in the next round), but also a double match scenario (where the 
 *  //? number of qualifying matches is more than the number of matches in the next round, but less than the next 
 *  //? ^2
 *
 *  This is where our matchesOrdered variable (result of reorderArray()) is very handy. Note that earlier in the 
 *  function we create a variable called:
 *      qualifyingParticipants
 *  This calculates the number of players needed for the qualifyingMatches (which is the number of matches * 2, since
 *  all qualifying matches must have exactly 2 players each). This leaves the participants array with the remaining
 *  players who are in this firstRound (the first non-qualifying round) - also known as our byes.
 *
 *  Now, we can loop through the matchesOrdered array in a very special way - from top to bottom, and then from 
 *  bottom to top again, using this little piece of maths:
 *      const index = i < n ? i : 2 * n - i - 1;
 *      matchesOrdered[index] //? This is what we use it for
 *  //? Note - this is how we allocate players even in a ^2 case, this works the same as the previous method, but 
 *  //? it also works for this !^2 case, to make the code universal.
 *  This means we then add the qualifyingParticipants sequentially to the firstRound matches. This means the top player 
 *  is allocated to first item, the second to the next one, and so on. However, remember that because matchesOrdered
 *  is a clever order which means that the second player is actually on the other side of the bracket (since the 
 *  original index was the final subarray).
 *
 *  Ok, NOW we create our qualifying matches! We again use matchesOrdered and that clever indexing system previously
 *  mentioned:
 *      const index = i < n ? i : 2 * n - i - 1;
 *  Now we loop through the qualifying match number (REMAINING participants.length / 2), create a qualifying match,
 *  assigning it's nextMatchId to matchesOrdered[index]._id and assigning the previousMatchId to 
 *  matchesOrdered[index] using the nullish coelecing operator:
 *      (matchesOrdered[index.previousMatchId ??= []).push(match._id)
 *  Because of our fancy index technique, the first match to have a previousMatchId is at matchesOrdered[0] and the 
 *  last match to have one is ALSO matchesOrdered[0].
 *
 *  Then, finally, we add our remaining participants to the qualifying matches through these loops:
 *
 *   for (const match of qualifyingMatches) {
 *       match.participants.push(participants.pop());
 *   }
 *   
 *   for (const match of qualifyingMatches.reverse()) {
 *       match.participants.push(participants.shift());
 *   }
 * 
 * These loops loop from the top to the bottom and back again (like our fancy indexing), but this code is much 
 * simplier, so we just run it through two loops.
 * 
 * FINALLY, collate everything together in one result array and return it:
 * 
 *   const result = [...matches.flat(), ...matchesOrdered, ...qualifyingMatches];
 *   return result;
 * ============================================================================================================= */

import mongoose from "mongoose";
import { MatchTypeLite,  PlayerTypePopulated, TeamTypePopulated } from "./types";
import HttpError from "./HttpError";

const getNextPowerOfTwo = (n:number):number => {
    let power = 1;
    while (power < n) {
        power *= 2;
    }
    return power;
}

const calculateByes = (n:number):number => {
    const nextPowerOfTwo = getNextPowerOfTwo(n);
    const result = nextPowerOfTwo - n;
    return result;
}

const splitIntoFours = (matches:MatchTypeLite[]):MatchTypeLite[][] => {
    const arr = [...matches];
    const result:MatchTypeLite[][] = [];
    for (let i = 0; i < arr.length; i+= 4) {
        result.push(arr.slice(i, i + 4));
    }
    return result;
}

const reorderGroups = (matches:MatchTypeLite[][]):MatchTypeLite[][] => {
    const result:MatchTypeLite[][] = [];
    for (let i = 0; i < matches.length; i++) {
        if (i % 2 === 0) {
            result.push(matches[i]);
        } else {
            result.push(matches[matches.length - i]);
        }
    }
    return result;
}

const reorderArray = (data:MatchTypeLite[][]):MatchTypeLite[] => {
    if (data[0].length < 3) return data.flat();
    const order = [0, 3, 2, 1];
    const result:MatchTypeLite[] = [];

    for (const index of order) {
        for (const subArray of data) {
            result.push(subArray[index]);
        }
    }
    return result;
}

const qualPlayersEqualsTotalPlayers = (qualPlayers:number, players:number, totalRounds:number):number => {
    return qualPlayers === players ? totalRounds : totalRounds - 1;
}

const createMatch = (
    tournamentRoundText:number,
    nextMatchId:string | null = null,
    qualifyingMatch:boolean = false
):MatchTypeLite => {
    const match = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        tournamentRoundText: tournamentRoundText.toString(),
        participants: [],
        nextMatchId,
        qualifyingMatch,
    };

    return match;
}

const generateFirstRoundMatches = (numOfParticipants:number):MatchTypeLite[][] => {
    const totalRounds = Math.ceil(Math.log2(numOfParticipants));
    const matchesByRound = [];
    const numOfQualPlayers = numOfParticipants - calculateByes(numOfParticipants);

    const finalMatch = createMatch(totalRounds);
    matchesByRound.push([finalMatch]);
    let round = 1;

    while(round < (qualPlayersEqualsTotalPlayers(numOfQualPlayers, numOfParticipants, totalRounds))) {
        const currentRoundMatches = [];
        for (let i = 0; i < matchesByRound.at(-1)!.length * 2; i++) {
            const nextMatchId = matchesByRound[round - 1][Math.floor(i / 2)]._id;
            const match = createMatch(totalRounds - round, nextMatchId);
            currentRoundMatches.push(match);
        }
        matchesByRound.push(currentRoundMatches);
        round++;
    }

    return matchesByRound;
}

export function generateMatches(participants: PlayerTypePopulated[] | TeamTypePopulated[]):MatchTypeLite[] {
    const numOfParticipants = participants.length;
    const matches = generateFirstRoundMatches(numOfParticipants);
    const firstRound = matches.pop() ?? [];
    if (firstRound.length < 1) throw new Error("Generate Matches Error: GM001");

    const intoFours = splitIntoFours(firstRound);
    const groupsOrdered = reorderGroups(intoFours);
    const matchesOrdered = reorderArray(groupsOrdered);
    const qualifyingParticipantsNum = numOfParticipants - calculateByes(numOfParticipants)
    const qualifyingParticipants = qualifyingParticipantsNum === participants.length 
        ? participants
        : participants.splice(0, participants.length - qualifyingParticipantsNum);
    const n = matchesOrdered.length;

    for (let i = 0; i < 2 * n; i++) {
        const index = i < n ? i : 2 * n - i - 1;
        if (qualifyingParticipants.length > 0) {
            const participant = qualifyingParticipants.shift();
            if (!participant) throw new HttpError("Generate Matches Error: GM002")

            if (participant.hasOwnProperty("user")) {
                (matchesOrdered[index].participants as PlayerTypePopulated[]).push(participant as PlayerTypePopulated);
            } else {
                (matchesOrdered[index].participants as TeamTypePopulated[]).push(participant as TeamTypePopulated);
            }
        } else {
            break;
        }
    }

    let numOfQualMatches = participants.length / 2;
    const qualifyingMatches:MatchTypeLite[] = [];

    for (let i = 0; i < 2 * n; i++) {
        const index = i < n ? i : 2 * n - i - 1;
        if (numOfQualMatches > 0) {
            const match = createMatch(1, matchesOrdered[index]._id, true);
            qualifyingMatches.push(match);
            (matchesOrdered[index].previousMatchId ??= []).push(match._id);
            numOfQualMatches--;
        } else {
            break;
        }
    }

    for (const match of qualifyingMatches) {
        const participant = participants.pop();
        if (!participant) throw new HttpError("Generate Matches Error: GM003");

        if (participant.hasOwnProperty("user")) {
            (match.participants as PlayerTypePopulated[]).push(participant as PlayerTypePopulated);
        } else {
            (match.participants as TeamTypePopulated[]).push(participant as TeamTypePopulated);
        }
    }                     
                          
    for (const match of qualifyingMatches.reverse()) {
        const participant = participants.shift();
        if (!participant) throw new HttpError("Generate Matches Error: GM003");
        
        if (participant.hasOwnProperty("user")) {
            (match.participants as PlayerTypePopulated[]).push(participant as PlayerTypePopulated);
        } else {
            (match.participants as TeamTypePopulated[]).push(participant as TeamTypePopulated);
        }
    }

    const result = [...matches.flat(), ...matchesOrdered, ...qualifyingMatches];
    return result;
}

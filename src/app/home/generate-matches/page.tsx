import { generateMatches } from "@/lib/generateMatches";
import { GenerateMatchesForm } from "./Form";
import NumbersOnly from "./NumbersOnly";
import AboutClient from "./AboutClient";
import Link from "next/link";
import { PlayerTypePopulated } from "@/lib/types";
import { convertToMatch } from "@/lib/matches";

export default function GenerateMatches() {
    return (
        <div className="flex-1 mx-auto px-1 sm:px-4">
            <div className="standard-container bg-lime-400/75">
                <h3 className="home-subtitle">Quick Generate Matches</h3>
            </div>
            <About />
            <NumbersOnly />
            <CreateYourOwn />
            <div className="flex mt-5">
                <Link href="/home" className="submit text-center">Return Home</Link>
            </div>
        </div>
    )
}

const generatePlayer = (i: number): PlayerTypePopulated => {
    return {
        _id: i.toString(),
        tournament: "",
        user: {
            firstName: i.toString(),
            lastName: "",
        },
        male: true,
        categories: [],
        seeded: false,
        ranking: i
    }
}

function About() {
    const players: PlayerTypePopulated[] = [];
    for (let i = 1; i <= 8; i++) {
        players.push(generatePlayer(i));

    }
    
    const matches = generateMatches(players);
    const matchesFinal = [];
    
    for (const match of matches) {
        const participantsPopulated = [];
        for (const participant of match.participants) {
            participantsPopulated.push({
                _id: participant._id,
                participantId: participant._id,
                participantModel: "Player",
                resultText: "",
                isWinner: false,
                status: "",
                name: "players" in participant
                    ? `${participant.players[0].user.firstName} ${participant.players[0].user.lastName}
                     and 
                     ${participant.players[1].user.firstName} ${participant.players[1].user.lastName}` 
                    : `${participant.user.firstName} ${participant.user.lastName}`,
            });
        }

        matchesFinal.push(convertToMatch(
            match,
            "",
            "",
            participantsPopulated,
            "SCHEDULED",
            new Date(),
            0
        ));
    }
    
    const matchesClient = JSON.parse(JSON.stringify(matchesFinal));

    return (
        <AboutClient matches={matchesClient} />
    )
}

function CreateYourOwn() {
    return (
        <div className="standard-container bg-slate-200/75 my-2.5">
            <h3 className="home-subtitle text-4xl!">Create Your Own</h3>
            <p className="my-2.5">
                You can quickly create your own bracket below using the function below - you just need to enter their names and rankings below:
            </p>
            <GenerateMatchesForm />
        </div>
    )
}

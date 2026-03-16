import { generateMatches } from "@/lib/generateMatches";
import { GenerateMatchesForm } from "./Form";
import NumbersOnly from "./NumbersOnly";
import AboutClient from "./AboutClient";
import Link from "next/link";

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

function About() {
    const players = ((n:number):string[] => {
        const result:string[] = [];
        for (let i = 1; i <= n; i++) {
            result.push("Player " + i.toString());
        }
        return result;
    })(8);

    const matches = generateMatches(players);
    
    for (let match of matches) {
        match.category = { name: "" };
        match.id = match._id;
        match.state = "SCHEDULED";
        match.participants = match.participants.map((participant) => {
            const newParticipant = {
                name: participant,
                resultText: ""
            };
            
            return newParticipant;
        });
    }
    
    const matchesClient = JSON.parse(JSON.stringify(matches));

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

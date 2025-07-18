import React, {useState, useEffect, ChangeEvent} from "react";
import { useNavigate } from "react-router-dom";

export function Management(){
    const [ mandanten, setMandanten ] = useState<string[]>()

    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetch("/api/ui/mandanten").then(rsp => {return rsp.json()}).then(json => {setMandanten(json)})
        } catch (err) {
            console.log(err.message)
        }
    }, [])

    async function selectMandant(event) {
        var v = event.target.innerText
        if (v.length)
        await fetch("/api/select/mandant", {
            method: "POST",
            body: v
        })
        navigate("/element/0")
    }

    return (
        <div className="p-4">
            <div>
                <p>Mandanten:</p>
                <ul className="list-disc pl-5">
                {mandanten?.map((m, idx) => {
                    return (
                        <li key={idx} onClick={selectMandant}>{m}</li>
                    )
                })}
                </ul>
            </div>
        </div>
    ) 
}
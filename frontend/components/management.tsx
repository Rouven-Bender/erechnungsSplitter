import React, {useState, useEffect, ChangeEvent} from "react";
import { useNavigate } from "react-router-dom";

import { MandantenSelector } from "./mandantenselector";

export function Management(){
    const [ mandanten, setMandanten ] = useState<string[]>()
    const [ years, setYears ] = useState<string[]>()
    const [ selectedM, selectMandant ] = useState("");
    const [ selectedY, selectYear ] = useState("");
    const [ exportMode, setExportMode ] = useState(false)
    const [ initDBMode, setInitDBMode ] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetch("/api/management/ui/mandanten").then(rsp => {return rsp.json()}).then(json => {setMandanten(json)})
            if (selectedM != "") {
                fetch("/api/management/ui/year", {method: "POST", body: selectedM}).then(rsp => {return rsp.json()}).then(json => {setYears(json)})
            }
        } catch (err) {
            console.log(err.message)
        }
    }, [selectedM])

    async function mandant(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectMandant(v)
    }
    async function year(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectYear(v)
    }

    async function select(){
        if (selectedM != "" && selectedY != "") {
            await fetch("/api/select/mandant", {
                method: "POST",
                body: JSON.stringify({
                    mandant: selectedM,
                    year: selectedY
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            navigate("/element/0")
        }
    }

    function unset_latest(){
        if (selectedY != "") {
            selectYear("")
            return;
        }
        if (selectedM != "") {
            selectMandant("")
            return;
        }
    }

    var selectorbox;
    if (exportMode) {
        selectorbox = <MandantenSelector purpose="Exportieren" endpoint="/api/management/export" download={true}/>
    }
    if (initDBMode) {
        selectorbox = <MandantenSelector purpose="Initialisieren" endpoint="/api/management/initdb"/>
    }

    var inner
    if (selectedM == "") {
        inner = (
            <div>
                <p>Mandanten:</p>
                <ul className="list-disc pl-5">
                {mandanten?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={mandant}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }
    if (selectedM != "" && selectedY == "") {
        inner = (
            <div>
                <p>Jahr:</p>
                <ul className="list-disc pl-5">
                {years?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={year}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }

    function exportBookings(){
        setExportMode(true);
        setInitDBMode(false);
    }
    function initDB(){
        setInitDBMode(true);
        setExportMode(false);
    }

    return (
        <div className="p-4 flex flex-row gap-4">
            <div>
                {inner}
                <div className="flex gap-3">
                    <button onClick={unset_latest}>Zurück</button>
                    <button onClick={select}>Öffnen</button>
                </div>
            </div>
            <div>
                <p>Aktionen:</p>
                <ul className="list-disc pl-5">
                    <li><a onClick={exportBookings}>Exportiere Aufteilungen</a></li>
                    <li><a onClick={initDB}>Initializiere Datenbank</a></li>
                </ul>
                {selectorbox}
            </div>
        </div>
    ) 
}
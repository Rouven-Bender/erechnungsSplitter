import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";

import { MandantAuswahl } from "../types";

export function MandantenSelector({purpose, endpoint, download, redirect}: {purpose: string, endpoint: string, download?: boolean, redirect?: string}){
    const [ mandanten, setMandanten ] = useState<string[]>()
    const [ years, setYears ] = useState<string[]>()
    const [ months, setMonths ] = useState<string[]>()
    const [ selectedM, selectMandant ] = useState("");
    const [ selectedMo, selectMonth ] = useState("");
    const [ selectedY, selectYear ] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        try {
            fetch("/api/management/ui/mandanten").then(rsp => {return rsp.json()}).then(json => {setMandanten(json)})
            if (selectedM != "") {
                var m: MandantAuswahl = {mandant: selectedM}
                fetch("/api/management/ui/year", {method: "POST", body: JSON.stringify(m), headers: {"Content-Type": "application/json"}}).then(rsp => {return rsp.json()}).then(json => {setYears(json)})
            }
            if (selectedY != "") {
                var m: MandantAuswahl = {mandant: selectedM, year: selectedY}
                fetch("/api/management/ui/month", {method: "POST", body: JSON.stringify(m), headers: {"Content-Type": "application/json"}}).then(rsp => {return rsp.json()}).then(json => {setMonths(json)})
            }
        } catch (err) {
            console.log(err.message)
        }
    }, [selectedM, selectedY])

    function mandant(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectMandant(v)
    }

    function year(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectYear(v)
    }

    async function month(event) {
        var v = event.target.innerText
        if (v.length == 0) {
            return;
        }
        selectMonth(v)
    }
    
    async function select() {
        if (selectedM != "" && selectedY != "") {
            var m: MandantAuswahl = {
                    mandant: selectedM,
                    year: selectedY,
                    month: selectedMo
                }
            const r = fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(m),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (download != undefined && download) {
                r.then(rsp => {return rsp.blob()}).then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                })
            }
            if (redirect != undefined) {
                await r;
                navigate(redirect);
            }
        }
    }

    function unset_latest(){
        if (selectedMo != "") {
            selectMonth("")
            return;
        }
        if (selectedY != "") {
            selectYear("")
            return;
        }
        if (selectedM != "") {
            selectMandant("")
            return;
        }
    }

    var inner;
    if (selectedM == "") {
        inner = (
            <div>
                <p>Wähle Mantant</p>
                <ul className="pl-3 list-disc">
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
                <p>Wähle Jahr</p>
                <ul className="pl-3 list-disc">
                {years?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={year}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }
    if (selectedM != "" && selectedY != "" && selectedMo == "") {
        inner = (
            <div>
                <p>Monat:</p>
                <ul className="list-disc pl-5">
                {months?.map((m, idx) => {
                    return (
                        <li key={idx}><a onClick={month}>{m}</a></li>
                    )
                })}
                </ul>
            </div>
        )
    }

    return (
        <div className="border-1"><div className="p-2">
            {inner}
            <div className="flex gap-3">
                <button onClick={unset_latest}>Zurück</button>
                <button onClick={select}>{purpose}</button>
            </div>
        </div></div>
    )
}
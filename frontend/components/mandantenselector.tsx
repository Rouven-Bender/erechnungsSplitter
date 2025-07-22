import React, {useState, useEffect} from "react";

export function MandantenSelector({purpose, endpoint, download}: {purpose: string, endpoint: string, download?: boolean}){
    const [ mandanten, setMandanten ] = useState<string[]>()
    const [ years, setYears ] = useState<string[]>()
    const [ selectedM, selectMandant ] = useState("");
    const [ selectedY, selectYear ] = useState("");

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
    
    async function select() {
        if (selectedM != "" && selectedY != "") {
            const r = fetch(endpoint, {
                method: "POST",
                body: JSON.stringify({
                    mandant: selectedM,
                    year: selectedY
                }),
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
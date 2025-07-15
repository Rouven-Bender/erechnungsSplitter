import React, { useState, useEffect } from "react";

export default function FileTree() {
    const [path, setPath] = useState("")
    const [render, setRender] = useState(0)
    const [dirs, setDirs] = useState([]);
    useEffect(() => {
        async function f() {
            try {
                var response = await fetch('/api/filetree/pwd')
                setPath(await response.text())
                response = await fetch('/api/filetree/ls')
                setDirs(await response.json())
            } catch(err){
                console.log(err.message);
            }
        };
        f();
    }, [render]);

    function openfolder(event) {
        async function f() {
            await fetch("/api/filetree/open", {
                method: "POST",
                body: event.target.innerText
            })
            setRender(render + 1);
        }
        f();
    }
    function resetFolder(){
        async function f(){
            await fetch("/api/filetree/reset")
            setRender(render+1);
        }
        f();
    }

    return (
        <div>
            <p>Aktueller Pfad: {path}</p>
            <div className="pb-4 gap-5 flex">
            <button>Diesen Pfad auswählen</button>
            <button onClick={resetFolder}>Zurücksetzen</button>
            </div>
            <div className="border-1 border-solid">
            <p onClick={openfolder}>..</p>
            {dirs?.map((dirs, idx) => {
                return (
                    <p key={idx} onClick={openfolder}>{dirs}</p>
                )
            })}
            </div>
        </div>
    )
}
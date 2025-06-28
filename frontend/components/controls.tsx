import React, { useState, useEffect } from "react";

type ControlData = {
    numberOfPDFS: number;
    currentOfPDFS: number;
};

export default function Controls(){
    const [data, setData] = useState<ControlData>()
    const [render, setRender] = useState(0)

    useEffect(() => {
        async function f() {
           try {
                var response = await fetch('/ui')
                setData(await response.json())
           } catch(err) {
                console.log(err.message)
           }
        }
        f();
    }, [render])

    return(
        <div>
            <p>Controls</p>
            <p>Anzahl von PDF's: {data?.numberOfPDFS}</p>
            <p>Aktuelle PDF: {data?.currentOfPDFS}</p>
        </div>
    )
}
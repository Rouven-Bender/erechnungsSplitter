import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function InvoicePager() {
    const { id } = useParams()

    const [ numberOfPDFS, setNumberofPDFs ] = useState(0)

    useEffect (() => {
        try {
            fetch("/api/ui/numberofPDFs").then(response => {return response.text()}).then(text => {setNumberofPDFs(parseInt(text))})
        } catch (err){
            console.log(err.message)
        }
    }, [id])

    if (id != undefined) {
        return (
            <div className="flex flex-row gap-4">
                {parseInt(id)-1 < 0 ? "" : <Link to={"/element/"+ (parseInt(id)-1).toString()}>Zurück</Link>}
                <p>PDF: {parseInt(id)+1} / {numberOfPDFS}</p>
                {parseInt(id)+1 == numberOfPDFS ? "": <Link to={"/element/"+ (parseInt(id)+1).toString()}>Überspringen</Link>}
            </div>
        )
    }
}
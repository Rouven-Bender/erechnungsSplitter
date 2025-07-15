import React, { useState, useEffect } from "react";

import { Account, PersonenkontoRsp } from "../types";
import { useParams } from "react-router-dom";

export default function Personenkonto({sender} : {sender : string | undefined}) {
    const { id } = useParams()
    const [ personenkonto, setPersonenkonto ] = useState<PersonenkontoRsp>()
    const [ addForm, setAddForm ] = useState(false)
    const [ errormsg, setErrorMsg ] = useState("")

    useEffect(() => {
        try {
            fetch("/api/ui/personenkonto/"+id?.toString()).then(rsp => {return rsp.json()}).then(json => {setPersonenkonto(json)})
        } catch (err) {
            console.log(err.message)
        }
    }, [id])

    function addPersonenkonto(formdata : FormData) {
        let k = formdata.get("personenkonto")
        if (k == null || k.toString() == "") {
            setErrorMsg("Eingabe war leer")
            return;
        }
        if (!k.toString().match("[0-9*]")){
            setErrorMsg("Eingabe beinhaltete mehr wie Zahlen")
            return;
        }

        async function f(body, k) {
            await fetch("/api/add/personenkonto", {
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (personenkonto != undefined) { // it should be defined when we get here
                let tmp:PersonenkontoRsp = {personenkonto: k};
                setPersonenkonto(tmp)
                setAddForm(false)
            }
        }
        if (sender != undefined){
            const a : Account = {
                name: sender,
                accountNumber: k.toString()
            }
            f(JSON.stringify(a), k)
        }

        if (errormsg.length != 0) {
            setErrorMsg("")
        }
    }

    if (personenkonto == undefined || personenkonto?.personenkonto?.length == 0) {
        if (addForm) {
            return (
                <form action={addPersonenkonto}>
                    <label htmlFor="personenkonto">Personenkontonummer: </label>
                    <input className="border-1" name="personenkonto"></input> 
                    <button className="pl-3" type="submit">Hinzufügen</button>
                    {errormsg.length != 0 ? <p className="text-red-50">{errormsg}</p>: ""}
                </form>
            )
        }
        if (sender == undefined || sender.length == 0) {
            return (
                <p>Senderdaten nicht erkannt</p>
            )
        }
        return (
            <div className="flex flex-row gap-4">
                <p>Kein Personenkonto für "{sender}" bekannt</p>
                <button className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center border-1 border-black"
                    onClick={() => {setAddForm(true)}}>
                  +
                </button>
            </div>
        )
    } 
    if (personenkonto?.personenkonto == undefined) {
        return (
            <p>Personenkontodaten noch nicht angekommen</p>
        )
    }
    return (
        <p>{sender} | Personenkonto: {personenkonto.personenkonto}</p>
    )
}
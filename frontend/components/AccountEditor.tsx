import React, {useState, useEffect} from "react";
import { Account } from "../types";

import { isNumber } from "../helpers";

import { Link } from "react-router-dom";

export function AccountEditor(){
    const [ accounts, setAccounts ] = useState<Account[]>([])
    const [ addDialogOpen, setAddDialogOpen ] = useState(false)

    useEffect(() => {
        try {
            fetch("/api/management/accounts").then(rsp => {return rsp.json()}).then(json => {setAccounts(json)})
        } catch(err){
            console.log(err.message)
        }
    }, [])

    function addEntry(formdata: FormData){
        var accnum = formdata.get("accountnumber")?.toString()
        var accname= formdata.get("accountname")?.toString()
        if (
            (accname == undefined || accnum == undefined)
            || (accname.length > 255 || !isNumber(accnum))
            || (accname.length == 0)
        ){
            return;
        }
        let acc: Account = {
            accountNumber: accnum,
            name: accname
        }
        fetch("/api/management/accounts", {
            method: "POST",
            body: JSON.stringify(acc),
            headers: {
                "Content-Type": "application/json"
            }
        })
        accounts.push(acc)
        setAccounts(accounts)
        setAddDialogOpen(false)
    }

    function deleteElement(acc: Account, idx: number) {
        fetch("/api/management/accounts", {
            method: "DELETE",
            body: JSON.stringify(acc),
            headers: {
                "Content-Type": "application/json"
            }
        })
        var before = accounts.slice(0, idx)
        var after = accounts.slice(idx+1, accounts.length)
        setAccounts(before.concat(after))
    }

    return (
        <div className="pl-4 pt-4"><div className="min-h-[95vh] max-h-[95vh] overflow-scroll">
            <table>
                <thead>
                <tr>
                    <th>Kontonummer</th>
                    <th>Kontotext</th>
                </tr>
                </thead>
                <tbody>
                {accounts.map((row: Account, idx:number) => {
                    return (
                        <tr key={idx}>
                            <td>{row.accountNumber}</td>
                            <td>{row.name}</td>
                            <td><a onClick={() => deleteElement(row, idx)}>Löschen</a></td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
            <div className="absolute bg-white bottom-[5%] right-[3%] flex flex-row">
                {addDialogOpen ? <div className="border-1">
                    <div className="flex"><button className="ml-auto pr-3" onClick={()=>{setAddDialogOpen(false)}}>X</button></div>
                    <form action={addEntry} className="flex flex-col">
                        <label>Kontonummer: <input className="border-1" type="text" name="accountnumber"/></label>
                        <label>Kontoname: <input className="border-1" type="text" name="accountname"/></label>
                        <button type="submit">Hinzufügen</button>
                    </form>
                </div> : 
                <div className="border-1 rounded-full">
                    <a onClick={() => {setAddDialogOpen(true)}}><img src="/plus.svg" alt="Hinzufügen Icon" width={"45"} height={"45"}/></a>
                </div>}
            </div>
            <div className="min-h-fit border-t-1">
                <Link className="bottom-5" to={"/management"}>Management</Link>
            </div>
        </div>
    )
}
import React from "react";
import {createRoot} from 'react-dom/client';

function Application(){
	return (
		<p>React loaded</p>
	)
}

const root = createRoot(document.getElementById('app'));
root.render(<Application/>)

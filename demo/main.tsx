import { createRoot } from "react-dom/client";
import { BoardGamesApp } from "../src";
import "./demo.css";

createRoot(document.getElementById("root") as HTMLElement).render(<BoardGamesApp />);

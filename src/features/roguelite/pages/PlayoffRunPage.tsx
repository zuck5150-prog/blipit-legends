import * as React from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { clearRun, createRun, loadRun, PLAYOFF_TEAMS, recordGame, ROUNDS, saveRun, type RunState } from "../runState";

const Page = styled.main`max-width:960px;margin:0 auto;padding:32px 20px 80px;`;
const Card = styled.section`border:1px solid ${({theme})=>theme.colors?.border ?? "#777"};border-radius:14px;padding:20px;margin:16px 0;`;
const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;`;
const Button = styled.button`padding:12px 14px;font:inherit;cursor:pointer;`;
const Big = styled(Button)`font-weight:800;padding:16px 22px;`;

export default function PlayoffRunPage() {
  const navigate = useNavigate();
  const [run, setRun] = React.useState<RunState | null>(() => loadRun());
  const [choosing, setChoosing] = React.useState(!run);
  const update = (next: RunState) => { setRun(next); saveRun(next); };
  const start = (team: string) => { const next = createRun(team); update(next); setChoosing(false); };
  const reset = () => { clearRun(); setRun(null); setChoosing(true); };
  if (choosing || !run) return <Page><h1>NEW PLAYOFF RUN</h1><p>Choose a club. One postseason. Lose a series and the run is over.</p><Grid>{PLAYOFF_TEAMS.map(team=><Button key={team} onClick={()=>start(team)}>{team}</Button>)}</Grid></Page>;
  const needed = Math.ceil(run.series.bestOf/2);
  return <Page>
    <p>PLAYOFF ROGUELITE · RUN {run.id.slice(-6).toUpperCase()}</p>
    <h1>{run.team}</h1>
    <Card><h2>POSTSEASON BRACKET</h2>{ROUNDS.map((r,i)=><p key={r.round}><b>{i<run.roundIndex?"✓ ":i===run.roundIndex?"▶ ":"○ "}{r.round}</b> · best of {r.bestOf}{i===run.roundIndex&&run.status==="active"?` · vs ${run.series.opponent}`:""}</p>)}</Card>
    {run.status==="active" && <Card><p>{run.series.round.toUpperCase()}</p><h2>{run.team} vs {run.series.opponent}</h2><h3>Series: {run.series.wins}-{run.series.losses} · first to {needed}</h3><p>The next step launches Ballgame. Until the game-result adapter is connected, the two result buttons below let us test the complete bracket/progression loop without changing the baseball engine.</p><Big onClick={()=>navigate("/exhibition/new")}>PLAY NEXT GAME IN BALLGAME →</Big><div><Button onClick={()=>update(recordGame(run,true))}>Record win (prototype)</Button> <Button onClick={()=>update(recordGame(run,false))}>Record loss (prototype)</Button></div></Card>}
    {run.status==="eliminated" && <Card><h2>RUN OVER</h2><p>{run.team} was eliminated in the {run.series.round}, {run.series.losses}-{run.series.wins}.</p><Big onClick={reset}>START ANOTHER RUN →</Big></Card>}
    {run.status==="champion" && <Card><h2>CHAMPIONS</h2><p>{run.team} survived the bracket and won the championship.</p><Big onClick={reset}>NEW RUN →</Big></Card>}
    <p><Button onClick={()=>navigate("/")}>Back to Ballgame</Button> <Button onClick={reset}>Abandon run</Button></p>
  </Page>;
}

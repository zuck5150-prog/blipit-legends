import * as React from "react";

import ManageTeamsScreen from "@feat/customTeams/pages/ManageTeamsScreen";
import AppLoadingFallback from "@feat/gameplay/components/AppLoadingFallback";
import AppShell from "@feat/gameplay/components/AppShell";
import HomeScreen from "@feat/gameplay/components/HomeScreen";
import RootLayout from "@feat/gameplay/components/RootLayout";
import { resetStaleInProgressGames } from "@feat/league/sim/resetStaleGames";
import { getTotalGameDays } from "@feat/leagues/utils/seasonPresets";
import { appLog } from "@shared/utils/logger";
import { createBrowserRouter, Navigate, redirect, useNavigate, useOutletContext } from "react-router";
import { getDb } from "@storage/db";
import type { AppShellOutletContext, SeasonRecord } from "@storage/types";

const CareerStatsPage=React.lazy(()=>import("@feat/careerStats/pages/CareerStatsPage"));
const ContactPage=React.lazy(()=>import("@feat/contact/pages/ContactPage"));
const ExhibitionSetupPage=React.lazy(()=>import("@feat/exhibition/pages/ExhibitionSetupPage"));
const GamePage=React.lazy(()=>import("@feat/gameplay/pages/GamePage"));
const HelpPage=React.lazy(()=>import("@feat/help/pages/HelpPage"));
const LeagueSetupWizard=React.lazy(()=>import("@feat/leagues/pages/LeagueSetupWizard"));
const LeaguesHubPage=React.lazy(()=>import("@feat/leagues/pages/LeaguesHubPage"));
const PlayerCareerPage=React.lazy(()=>import("@feat/careerStats/pages/PlayerCareerPage"));
const SavesPage=React.lazy(()=>import("@feat/saves/pages/SavesPage"));
const SeasonHomePage=React.lazy(()=>import("@feat/leagues/pages/SeasonHomePage"));
const SeasonSchedulePage=React.lazy(()=>import("@feat/leagues/pages/SeasonSchedulePage"));
const SeasonTeamPage=React.lazy(()=>import("@feat/leagues/pages/SeasonTeamPage"));
const PlayoffRunPage=React.lazy(()=>import("@feat/roguelite/pages/PlayoffRunPage"));
function LazyRoute({children}:{children:React.ReactNode}){return <React.Suspense fallback={<AppLoadingFallback label="Loading page…"/>}>{children}</React.Suspense>}
function HomeRoute(){const ctx=useOutletContext<AppShellOutletContext>();const navigate=useNavigate();const[activeSeasonId,setActiveSeasonId]=React.useState<string|null>(null),[activeSeasonLabel,setActiveSeasonLabel]=React.useState<string|null>(null);React.useEffect(()=>{getDb().then(async db=>{const docs=await db.seasons.find({selector:{status:"active"}}).exec();if(docs.length){const s=docs[0].toJSON() as unknown as SeasonRecord;setActiveSeasonId(s.id);const total=getTotalGameDays(s.preset,s.seasonLength);setActiveSeasonLabel(`${s.name} · day ${Math.min(s.currentGameDay+1,total)} / ${total}`)}else{setActiveSeasonId(null);setActiveSeasonLabel(null)}}).catch(()=>{setActiveSeasonId(null);setActiveSeasonLabel(null)})},[]);return <><HomeScreen onNewGame={ctx.onNewGame} onLoadSaves={ctx.onLoadSaves} onManageTeams={ctx.onManageTeams} onResumeCurrent={ctx.hasActiveSession?ctx.onResumeCurrent:undefined} onHelp={ctx.onHelp} onContact={ctx.onContact} onCareerStats={ctx.hasCareerStats?ctx.onCareerStats:undefined} activeSeasonId={activeSeasonId} activeSeasonLabel={activeSeasonLabel} onContinueSeason={activeSeasonId?()=>navigate(`/leagues/${activeSeasonId}`):undefined} onStartLeague={()=>navigate("/leagues")}/><div style={{position:"fixed",right:16,bottom:16,zIndex:50}}><button style={{padding:"14px 18px",fontWeight:800}} onClick={()=>navigate("/playoff-run")}>PLAYOFF ROGUELITE →</button></div></>}
function TeamsRoute(){const ctx=useOutletContext<AppShellOutletContext>();return <ManageTeamsScreen onBack={ctx.onBackToHome} hasActiveGame={ctx.hasActiveSession}/>}
function GameRoute(){return <LazyRoute><GamePage/></LazyRoute>}
export const router=createBrowserRouter([{element:<RootLayout/>,children:[{element:<AppShell/>,children:[
{index:true,element:<HomeRoute/>},{path:"playoff-run",element:<LazyRoute><PlayoffRunPage/></LazyRoute>},{path:"game",element:<GameRoute/>},{path:"teams",element:<TeamsRoute/>},{path:"teams/new",element:<TeamsRoute/>},{path:"teams/:teamId/edit",element:<TeamsRoute/>,loader:async({params})=>!params.teamId?redirect("/teams"):null},{path:"saves",element:<LazyRoute><SavesPage/></LazyRoute>},{path:"help",element:<LazyRoute><HelpPage/></LazyRoute>},{path:"contact",element:<LazyRoute><ContactPage/></LazyRoute>},{path:"exhibition/new",element:<LazyRoute><ExhibitionSetupPage/></LazyRoute>},{path:"career-stats",element:<Navigate to="/stats" replace/>},{path:"stats",element:<LazyRoute><CareerStatsPage/></LazyRoute>},{path:"stats/:teamId",element:<LazyRoute><CareerStatsPage/></LazyRoute>},{path:"stats/:teamId/players/:playerId",element:<LazyRoute><PlayerCareerPage/></LazyRoute>},{path:"stats/players/:playerId",element:<LazyRoute><PlayerCareerPage/></LazyRoute>},
{path:"leagues",loader:async()=>{try{await resetStaleInProgressGames()}catch(err){appLog.warn("[leagues loader] resetStaleInProgressGames failed:",err)}return null},element:<React.Suspense fallback={null}><LeaguesHubPage/></React.Suspense>},{path:"leagues/new",element:<React.Suspense fallback={null}><LeagueSetupWizard/></React.Suspense>},{path:"leagues/:seasonId",element:<React.Suspense fallback={null}><SeasonHomePage/></React.Suspense>},{path:"leagues/:seasonId/schedule",element:<React.Suspense fallback={null}><SeasonSchedulePage/></React.Suspense>},{path:"leagues/:seasonId/teams/:seasonTeamId",element:<React.Suspense fallback={null}><SeasonTeamPage/></React.Suspense>}
]}]}]);

import { describe, expect, it } from "vitest";
import { createRun, recordGame } from "./runState";

describe("playoff roguelite run", () => {
  it("starts in a best-of-three Wild Card series", () => {
    const run=createRun("Baltimore Birds");
    expect(run.status).toBe("active");
    expect(run.series.round).toBe("Wild Card");
    expect(run.series.bestOf).toBe(3);
  });
  it("eliminates the player after two Wild Card losses", () => {
    let run=createRun("Baltimore Birds");
    run=recordGame(run,false);run=recordGame(run,false);
    expect(run.status).toBe("eliminated");
  });
  it("advances after winning a series and can win the championship", () => {
    let run=createRun("Baltimore Birds");
    const winSeries=()=>{const needed=Math.ceil(run.series.bestOf/2);for(let i=0;i<needed;i++)run=recordGame(run,true)};
    winSeries();expect(run.series.round).toBe("Division Series");
    winSeries();expect(run.series.round).toBe("Championship Series");
    winSeries();expect(run.series.round).toBe("Championship");
    winSeries();expect(run.status).toBe("champion");
    expect(run.completedRounds).toHaveLength(4);
  });
});

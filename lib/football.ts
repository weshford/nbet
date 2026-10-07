export const teams = [
['ATL','Atlanta Hawks','Atlanta','State Farm Arena','#E03A3E'],['BOS','Boston Celtics','Boston','TD Garden','#007A33'],['BKN','Brooklyn Nets','Brooklyn','Barclays Center','#000000'],['CHA','Charlotte Hornets','Charlotte','Spectrum Center','#1D1160'],['CHI','Chicago Bulls','Chicago','United Center','#CE1141'],['CLE','Cleveland Cavaliers','Cleveland','Rocket Arena','#860038'],['DAL','Dallas Mavericks','Dallas','American Airlines Center','#00538C'],['DEN','Denver Nuggets','Denver','Ball Arena','#0E2240'],['DET','Detroit Pistons','Detroit','Little Caesars Arena','#C8102E'],['GSW','Golden State Warriors','San Francisco','Chase Center','#1D428A'],['HOU','Houston Rockets','Houston','Toyota Center','#CE1141'],['IND','Indiana Pacers','Indianapolis','Gainbridge Fieldhouse','#002D62'],['LAC','LA Clippers','Inglewood','Intuit Dome','#C8102E'],['LAL','Los Angeles Lakers','Los Angeles','Crypto.com Arena','#552583'],['MEM','Memphis Grizzlies','Memphis','FedExForum','#5D76A9'],['MIA','Miami Heat','Miami','Kaseya Center','#98002E'],['MIL','Milwaukee Bucks','Milwaukee','Fiserv Forum','#00471B'],['MIN','Minnesota Timberwolves','Minneapolis','Target Center','#0C2340'],['NOP','New Orleans Pelicans','New Orleans','Smoothie King Center','#0C2340'],['NYK','New York Knicks','New York','Madison Square Garden','#006BB6'],['OKC','Oklahoma City Thunder','Oklahoma City','Paycom Center','#007AC1'],['ORL','Orlando Magic','Orlando','Kia Center','#0077C0'],['PHI','Philadelphia 76ers','Philadelphia','Wells Fargo Center','#006BB6'],['PHX','Phoenix Suns','Phoenix','PHX Arena','#1D1160'],['POR','Portland Trail Blazers','Portland','Moda Center','#E03A3E'],['SAC','Sacramento Kings','Sacramento','Golden 1 Center','#5A2D81'],['SAS','San Antonio Spurs','San Antonio','Frost Bank Center','#C4CED4'],['TOR','Toronto Raptors','Toronto','Scotiabank Arena','#CE1141'],['UTA','Utah Jazz','Salt Lake City','Delta Center','#002B5C'],['WAS','Washington Wizards','Washington','Capital One Arena','#002B5C']
].map(([id,name,city,stadium,color])=>({id,name,city,stadium,color}));

// Demo fixtures for the 2026/27 season. Replace with a live provider when one is connected.
export const matches = [
['BOS','NYK','2026-10-20T23:30:00Z'],['LAL','GSW','2026-10-21T02:00:00Z'],['OKC','DEN','2026-10-21T23:30:00Z'],['MIL','CHI','2026-10-22T00:00:00Z'],['DAL','HOU','2026-10-22T00:30:00Z'],['MIA','ORL','2026-10-22T23:30:00Z'],['PHX','SAS','2026-10-23T01:00:00Z'],['CLE','DET','2026-10-23T23:00:00Z'],['PHI','BKN','2026-10-24T00:00:00Z']
].map(([home,away,date])=>({id:home+'-'+away,home,away,date}));

export type RecordItem={id:string;kind:string;target:string;value:string;updated:string};

// Preseason display: all teams start at 0–0 until live standings are connected.
export const standings = teams.map((team,index)=>({id:team.id,rank:index+1,played:0,won:0,lost:0,winPct:0,streak:'–'}));

export function rankStatus(rank:number){
  return rank<=6?{label:'Direkte Playoffs',tone:'leader'}:rank<=10?{label:'Play-In',tone:'chasing'}:{label:'Außerhalb Play-In',tone:'midfield'};
}

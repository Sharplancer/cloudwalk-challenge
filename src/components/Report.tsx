import React from "react";
import {
    Spinner,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Switch,
    Code,
    Stack
} from '@chakra-ui/react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { fetchLogData } from "../store/logdata-slice";
import { useEffect, useState } from "react";
const DISPLAY_MODE = {
    TABLE_MODE: 0,
    JSON_MODE: 1,
}

const Report = () => {
    const dispatch = useDispatch();
    const error = useSelector((state: RootState) => state.logData.error);
    const status = useSelector((state: RootState) => state.logData.status);
    const [displayMode, setDisplayMode] = useState(DISPLAY_MODE.TABLE_MODE);

    const { matchInfos, matchInfoJSON, playerRank, gameKills } = useSelector((state: RootState) => {
        let logData = state.logData.logData;

        let lines = logData.split("\n");
        let matchInfos = [];
        let matchInfoJSON : { [key: string]: any } = {};
        let game : { [key: string]: any } = {};
        let total_kills : number = 0;
        let players : { [key: string]: any } = [];
        let kills : { [key: string]: any } = {};
        let killedByMeans : { [key: string]: any } = {};
        let gameCount : number = 0;
        let gameKills : { [key: string]: any } = {};
        let playerRank : { [key: string]: any } = [];

        for (var i = 0; i < lines.length; i++) {
            //when a match finished, initialize the variables again
            if (lines[i].includes(" ShutdownGame:")) {
                game["total_kills"] = total_kills;
                game["players"] = players;
                game["kills"] = kills;
                game["killed_by_means"] = killedByMeans;

                matchInfos[gameCount++] = JSON.parse(JSON.stringify(game));
                matchInfoJSON["game-" + gameCount] = JSON.parse(JSON.stringify(game));
                total_kills = 0;
                players = [];
                kills = {};
                killedByMeans = {};
            }
            //generate a grouped information for one match
            if (lines[i].includes(" Kill: ")) {
                let tempSplits_1 = lines[i].split(": ");
                let tempSplits_2 = tempSplits_1[tempSplits_1.length - 1].split(" killed ");
                let tempSplits_3 = tempSplits_2[1].split(" by ");
                let killer = tempSplits_2[0];
                let chase = tempSplits_3[0];
                if (killedByMeans[tempSplits_3[1]] === undefined) {
                    killedByMeans[tempSplits_3[1]] = 1;
                } else {
                    killedByMeans[tempSplits_3[1]]++;
                }

                players.includes(killer) === false && killer !== "<world>" && players.push(killer);
                players.includes(chase) === false && chase !== "<world>" && players.push(chase);

                playerRank.includes(killer) === false && killer !== "<world>" && playerRank.push(killer);
                playerRank.includes(chase) === false && chase !== "<world>" && playerRank.push(chase);

                if (killer !== "<world>") {
                    if (kills[killer] === undefined) {
                        kills[killer] = 1;
                    } else {
                        kills[killer]++;
                    }
                    if (gameKills[killer] === undefined) {
                        gameKills[killer] = 1;
                    } else {
                        gameKills[killer]++;
                    }
                } else {
                    if (kills[chase] === undefined) {
                        kills[chase] = -1;
                    } else {
                        kills[chase]--;
                    }
                    if (gameKills[chase] === undefined) {
                        gameKills[chase] = -1;
                    } else {
                        gameKills[chase]--;
                    }
                }
                total_kills++;
            }
        }

        console.log(gameKills);
        //rank the players
        playerRank.sort(function(a: any, b: any){ return (gameKills[b] === undefined ? gameKills[b] = 0 && 0 : gameKills[b]) - (gameKills[a] === undefined ? gameKills[a] = 0 && 0 : gameKills[a])});

        return { matchInfos, matchInfoJSON, playerRank, gameKills };
    });

    useEffect(() => {
        dispatch(fetchLogData()); 
    }, [dispatch]);

    const onHandleMode = () => {
        console.log(displayMode);
        if(displayMode === DISPLAY_MODE.TABLE_MODE)
            setDisplayMode(DISPLAY_MODE.JSON_MODE);
        else
            setDisplayMode(DISPLAY_MODE.TABLE_MODE);
    }

    return (
        <div>
            <Switch onChange={onHandleMode}/>
            { status === 'pending' && <Spinner />}
            { status !== 'pending' && error === '' && 
            displayMode === DISPLAY_MODE.TABLE_MODE ?
                <TableContainer>
                    <Table variant='simple'>
                        <TableCaption>Player rank according to total game kills</TableCaption>
                        <Thead>
                        <Tr>
                            <Th>Rank</Th>
                            <Th>Name</Th>
                            <Th>Kills</Th>
                        </Tr>
                        </Thead>
                        <Tbody>
                            {
                                playerRank.map((player : any, i : number) => {
                                    return(
                                        <Tr key={i}>
                                            <Th>{i + 1}</Th>
                                            <Th>{player}</Th>
                                            <Th>{gameKills[player]}</Th>
                                        </Tr>
                                    );
                                })
                            }
                        </Tbody>
                    </Table>
                    <br></br>
                    <Table variant='simple'>
                        <TableCaption>Each match information</TableCaption>
                        <Thead>
                        <Tr>
                            <Th>No</Th>
                            <Th>TotolKills</Th>
                            <Th>Players</Th>
                            <Th>Kills</Th>
                            <Th>Killed By Means</Th>
                        </Tr>
                        </Thead>
                        <Tbody>
                            {
                                matchInfos.map((matchInfo : any, i : number) => {
                                    return(
                                        <Tr key={i}>
                                            <Td>game-{i + 1}</Td>
                                            <Td>{matchInfo.total_kills}</Td>
                                            <Td><pre>{matchInfo.players.toString().replaceAll(',', ',\n')}</pre></Td>
                                            <Td><pre>{JSON.stringify(matchInfo.kills).replaceAll(',', ',\n').replace('{', '').replace('}', '')}</pre></Td>
                                            <Td><pre>{JSON.stringify(matchInfo.killed_by_means).replaceAll(',', ',\n').replace('{', '').replace('}', '')}</pre></Td>
                                        </Tr>
                                    );
                                })
                            }
                        </Tbody>
                    </Table>
                </TableContainer>
            :   <Stack direction='row'>
                    <Code><pre>{JSON.stringify(playerRank, null, 2)}</pre></Code>
                    <Code><pre>{JSON.stringify(matchInfoJSON, null, 2)}</pre></Code>
                </Stack>
        }
        </div>
    )
}

export default React.memo(Report);
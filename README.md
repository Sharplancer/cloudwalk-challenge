# About Project

## Quick browse
http://sharplancer.github.io/cloudwalk-challenge

## Tech Stack
React.js, Redux, Hooks, TypeScript

## Theme
Chakra-ui

## Development

### Structure
```
|_components
| |_Report.tsx
|
|_pages
| |_HomePage.tsx
|
|_store
| |_index.tsx
| |_logdata-slice.tsx
|
|_App.tsx
|
|_index.tsx
```

### Code
### index.tsx
```TypeScript
    ...
    <Provider store={store}>
        <ColorModeScript />
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider> 
    </Provider>
    ...
```

### pages/HomePage.tsx
- Shows project title
- Involve Report component
```TypeScript
    ...
        <Box>
            <Text fontSize="6xl" textAlign='center'>Welcome to CloudWalk Challege app</Text>
            <Report></Report>
        </Box>
    ...
```

### components/Report.tsx
Shows the result of grouped information and a player rank in table or JSON.

- Fetch log information - Trigger fetchLogData action in redux read the log file
```TypeScript
    useEffect(() => {
        dispatch(fetchLogData()); 
    }, [dispatch]);
```
- LogParsher, Group game data of each match from Quake log information, and Collect Kill data
```TypeScript
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
```
- Shows grouped information in table
    Example of showing the player rank.
```TypeScript
    ...
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
    ...
```
- Show grouped information in JSON
```TypeScript
    ...
    <Code><pre>{JSON.stringify(playerRank, null, 2)}</pre></Code>
    <Code><pre>{JSON.stringify(matchInfoJSON, null, 2)}</pre></Code>
    ...
```

### store/logdata-slice.js

This is redux, and I used it to control the logData as a global state and produce a fetch request.
- Set the fetch Url as a constant
```TypeScript
const API_URL = process.env.REACT_APP_BIKES_API_URL || 'https://gist.githubusercontent.com/cloudwalk-tests/be1b636e58abff14088c8b5309f575d8/raw/df6ef4a9c0b326ce3760233ef24ae8bfa8e33940/qgames.log';
```

- Redux, reducers
``` TypeScript
const logDataSlice = createSlice({
    name: 'logdata',
    initialState: initialState,
    reducers: {
        logDataRequest(state: LogDataState, action: PayloadAction<{ name: string }>) {
            state.error = '';
            state.status = 'pending';
            state.name = action.payload.name;
        },
        logDataSuccess(state: LogDataState, action: PayloadAction<{ logData: string }>) {
            state.logData = action.payload.logData;
            state.status = 'success';
        },
        logDataFail(state: LogDataState, action: PayloadAction<string>) {
            state.error = action.payload;
            state.status = 'failed';
        }
    }
});
```
- Fetch request function
```TypeScript
export const fetchLogData = () => {
    return async (dispatch: Dispatch) => {
        dispatch(logDataActions.logDataRequest({ name: 'LIST' }));
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
            });
            const data = await response.text();
            if (!response.ok) {
                throw new Error(data || response.statusText);
            }
            const logData = data;
            dispatch(logDataActions.logDataSuccess({ logData }));
        } catch (error) {
            dispatch(logDataActions.logDataFail('error occured'))
        }
    }
}
```
Thank you.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


import { TickerSearchDialog } from "@/components/TickerSearchDialog";
import { DataModeType, DexGexType } from "@/lib/types";
import { Tabs, Tab, Box, FormControl, InputLabel, MenuItem, Paper, Select, Checkbox, ListItemText, OutlinedInput, SelectChangeEvent, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";

export const ChartTypeSelectorTab = (props: { tab: DexGexType; onChange: (v: DexGexType) => void }) => {
    return <Tabs
        value={props.tab}
        onChange={(e, v) => { props.onChange(v) }}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth">
        <Tab label="Dex" value={'DEX'}></Tab>
        <Tab label="Gex" value={'GEX'}></Tab>
        <Tab label="OI" value={'OI'}></Tab>
        <Tab label="Volume" value={'VOLUME'}></Tab>
    </Tabs>
}

const dteOptions = [7,
    30,
    50,
    90,
    180,
    400,
    1000];
const stikeOptions = [20,
    30,
    50,
    80,
    100, 150,
    200]

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

export const DteStrikeSelector = (props: {
    symbol: string, dte: number, availableDates: string[], strikeCounts: number,
    setCustomExpirations: (v: string[]) => void,
    setDte: (v: number) => void, setStrikesCount: (v: number) => void, hasHistoricalData: boolean, dataMode: DataModeType, setDataMode: (v: DataModeType) => void
}) => {
    const { symbol, setDte, setStrikesCount, strikeCounts, dte, dataMode, setDataMode, hasHistoricalData, availableDates, setCustomExpirations } = props;
    const dataModes = hasHistoricalData ? ['CBOE', 'TRADIER', 'HISTORICAL'] : ['CBOE', 'TRADIER'];
    const [selectedExpirations, setSelectedExpirations] = useState<string[]>([]);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const enableCustomDte = isMobile == false && dte == -1;
    const handleCustomDteSelectionChange = (event: SelectChangeEvent<typeof selectedExpirations>) => {
        const {
            target: { value },
        } = event;
        setSelectedExpirations(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
        setCustomExpirations(typeof value === 'string' ? value.split(',') : value)
    };

    return <Paper sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl sx={{ m: 1 }} size="small">
            <TickerSearchDialog symbol={symbol} basePath='' clearQuery={true} />
        </FormControl>
        <Box display="flex">
            <FormControl sx={{ m: 1, justifyItems: 'right' }} size="small">
                <InputLabel>Mode</InputLabel>
                <Select id="dataMode" value={dataMode} label="Mode" onChange={(e) => setDataMode(e.target.value as DataModeType)}>
                    {dataModes.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl sx={{ m: 1, justifyItems: 'right' }} size="small">
                <InputLabel>DTE</InputLabel>
                <Select id="dte" value={dte} label="DTE" onChange={(e) => setDte(e.target.value as number)}>
                    {dteOptions.map((dte) => <MenuItem key={dte} value={dte}>{dte}</MenuItem>)}
                    {!isMobile && <MenuItem key="custom" value="-1">Custom</MenuItem>}
                </Select>
            </FormControl>
            {
                enableCustomDte && <FormControl sx={{ m: 1, width: 120 }} size="small">
                    <InputLabel>Custom DTE</InputLabel>
                    <Select
                        multiple
                        value={selectedExpirations}
                        onChange={handleCustomDteSelectionChange}
                        label="Custom DTE"
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}
                    >
                        {availableDates.map((name) => (
                            <MenuItem key={name} value={name}>
                                <Checkbox size="small" checked={selectedExpirations.includes(name)} />
                                <ListItemText primary={name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            }
            <FormControl sx={{ m: 1 }} size="small">
                <InputLabel>Strikes</InputLabel>
                <Select id="strikes" value={strikeCounts} label="Strikes" onChange={(e) => setStrikesCount(e.target.value as number)}>
                    {stikeOptions.map((strike) => <MenuItem key={strike} value={strike}>{strike}</MenuItem>)}
                </Select>
            </FormControl>
        </Box>
    </Paper>
}
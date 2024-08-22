import { Dialog, DialogContent, DialogActions, Button, Typography, LinearProgress, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Paper, Box } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartsReferenceLine } from '@mui/x-charts';
import { OptionsHedgingData, useDeltaGammaHedging } from "@/lib/socket";
import { getColorPallete } from "@/lib/color";
import { humanAbsCurrencyFormatter } from "@/lib/formatters";
import { useQueryState, parseAsInteger, parseAsStringEnum } from "nuqs";

interface ITickerProps {
    symbol: string,
    onClose: () => void
}

const colorCodes = getColorPallete();

enum DexGexType {
    'DEX' = 'DEX',
    'GEX' = 'GEX'
}

interface IExpo {
    data: OptionsHedgingData,
    exposure: 'dex' | 'gex',
    symbol: string,
    dte: number
}

const Expo = (props: IExpo) => {
    const { data, dte, symbol } = props;
    const height = data.strikes.length * 15;
    const yaxisline = Math.max(...data.strikes.filter(j => j <= data.currentPrice));
    const series = data.expirations.flatMap(j => {
        return [{
            dataKey: `${j}-call`, label: `${j}`, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        },
        {
            dataKey: `${j}-put`, label: `${j}`, stack: `stack`, color: colorCodes[data.expirations.indexOf(j)]
        }]
    });
    const gammaOrDelta = (props.exposure == 'dex' ? 'Delta' : 'Gamma')

    const { dataset, maxPosition } = props.exposure == 'dex' ? data.deltaDataset : data.gammaDataset;
    return <Paper><Typography variant="h5" align="center" gutterBottom>
        ${symbol.toUpperCase()} ABS {gammaOrDelta} Hedging Exposure ({dte} DTE)
    </Typography><BarChart
        height={height}
        dataset={dataset}
        series={series}
        tooltip={{
            trigger: 'none'
        }}
        yAxis={[
            {
                dataKey: 'strike',
                scaleType: 'band',
                reverse: true,
                valueFormatter: (tick) => `$${Number(tick).toFixed(2)}`
            },
        ]}
        layout="horizontal"
        xAxis={
            [
                {
                    label: `${gammaOrDelta} Hedging Exposure`,
                    scaleType: 'linear',
                    min: -maxPosition * 1.05,  //5% extra to allow some spacing
                    max: maxPosition * 1.05,
                    valueFormatter: humanAbsCurrencyFormatter
                }
            ]
        }

        slotProps={{
            legend: {
                seriesToDisplay: data.expirations.map(j => {
                    return {
                        id: j,
                        color: colorCodes[data.expirations.indexOf(j)],
                        label: j
                    }
                }),
                direction: 'column',
                position: {
                    vertical: 'top',
                    horizontal: 'right',
                },
                itemMarkWidth: 32,
                itemMarkHeight: 12,
                markGap: 5,
                itemGap: 5,
            }
        }}>

            <ChartsReferenceLine x={0} />
            <ChartsReferenceLine y={yaxisline} label={"SPOT PRICE: $" + data.currentPrice}
                labelAlign="start"
                lineStyle={{
                    color: 'red',
                    stroke: 'red'
                }}
                labelStyle={
                    {
                        color: 'red',
                        stroke: 'red'
                    }
                } />
        </BarChart></Paper>
}

export const DeltaGammaHedging = (props: ITickerProps) => {
    const { onClose } = props;
    const [dte, setDte] = useQueryState('dte', parseAsInteger.withDefault(50));
    const [strikeCounts, setStrikesCount] = useQueryState('sc', parseAsInteger.withDefault(30));

    const { data, isLoading } = useDeltaGammaHedging(props.symbol, dte, strikeCounts);
    const [gexTab, setGexTab] = useQueryState<DexGexType>('dgextab', parseAsStringEnum<DexGexType>(Object.values(DexGexType)).withDefault(DexGexType.DEX));

    // if (isLoading) return <LinearProgress />;
    // if (!data) return <div>No data to show!!!</div>;

    return (
        <Dialog fullWidth={true} fullScreen={true} open={true} onClose={onClose} aria-labelledby="delta-hedging-dialog">
            <DialogContent>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>DTE</InputLabel>
                    <Select
                        id="dte"
                        value={dte}
                        label="DTE"
                        onChange={(e) => setDte(e.target.value as number)}
                    >
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={90}>90</MenuItem>
                        <MenuItem value={180}>180</MenuItem>
                        <MenuItem value={400}>400</MenuItem>
                        <MenuItem value={1000}>1000</MenuItem>
                    </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel>Strikes</InputLabel>
                    <Select
                        id="strikes"
                        value={strikeCounts}
                        label="Strikes"
                        onChange={(e) => setStrikesCount(e.target.value as number)}
                    >
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={80}>80</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={gexTab}
                        onChange={(e, v) => setGexTab(v)}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                    >
                        <Tab label="Dex" value={'DEX'}></Tab>
                        <Tab label="Gex" value={'GEX'}></Tab>
                    </Tabs>
                </Box>
                {
                    isLoading ? <LinearProgress /> : data ? <Expo data={data} exposure={gexTab == DexGexType.DEX ? 'dex' : 'gex'} symbol={props.symbol} dte={dte} /> : <div>no data...</div>
                }
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose} color="secondary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
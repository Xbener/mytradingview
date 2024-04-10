'use client';
import { GridColDef, GridActionsCellItem, DataGrid, useGridApiRef, gridClasses } from "@mui/x-data-grid";
import { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';
import { CloseTradeCloseDialogReason, CloseTradeDialog } from "./close-trade";
import { ConfirmDialog } from "./confirm-dialog";
import { FormControlLabel, Switch } from "@mui/material";

import { ConditionalFormattingBox } from "./conditional-formatting";
import { useTrades } from "@/lib/useTrades";
import { percentageFormatter } from "@/lib/formatters";
import { ITradeView } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', }).format;
const fixedCurrencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format;
const dateFormatter = (v: string) => v && dayjs(v.substring(0, 10)).format('DD/MM/YYYY');   //to avoid utc conversion strip the time part
const shortDateFormatter = (v: string) => v && dayjs(v.substring(0, 10)).format('DD/MM/YYYY');   //to avoid utc conversion strip the time part

const TickerName = (p: { trade: ITradeView }) => {
    const { trade } = p;

    return <div>{trade.symbol} {trade.strikePrice as unknown as string} {shortDateFormatter(trade.contractExpiry as unknown as string)} x {trade.numberOfContracts}</div>

}

export const TradeList = () => {
    const { trades, deleteTrade, reloadTrade } = useTrades();
    const [showCloseTrades, toggleShowCloseTrades] = useState(false);//useShowCloseTrades();
    const traderows = showCloseTrades ? trades : trades.filter(x => !x.isClosed);
    const [currentTrade, setCurrentTrade] = useState<ITradeView | null>(null);
    const apiRef = useGridApiRef();

    const [openCloseTrade, setOpenCloseTrade] = useState(false);
    const [isDeleteTradeOpen, setisDeleteTradeOpen] = useState(false);
    const [deleteTradeId, setDeleteTradeId] = useState('');
    const handleCloseContractClick = (trade: ITradeView) => {
        setCurrentTrade(trade);
        setOpenCloseTrade(true);
    }

    const handleDeleteTrade = (trade: ITradeView) => {
        setisDeleteTradeOpen(true);
        setDeleteTradeId(trade.id);
    }

    const columns: GridColDef<ITradeView>[] = [
        { field: 'Ticker', minWidth: 150, flex: 1, headerName: 'Contract', renderCell: (p) => <TickerName trade={p.row} /> },
        // { field: 'transactionStartDate', width: 90, headerName: 'Start', valueFormatter: dateFormatter },
        // { field: 'transactionEndDate', width: 90, headerName: 'End', valueFormatter: dateFormatter },
        // { field: 'contractExpiry', width: 90, headerName: 'Expiry', valueFormatter: dateFormatter },
        { field: 'contractType', width: 70, headerName: 'Type', },
        // { field: 'symbol', width: 60, headerName: 'Ticker', },

        // { field: 'isClosed', headerName: 'Cleared', type: 'boolean' },
        // { field: 'strikePrice', width: 90, headerName: 'Strike Price', type: 'number', valueFormatter: currencyFormatter },
        // { field: 'numberOfContracts', width: 60, sortable: false, filterable: false, hideable: false, headerName: 'Size', type: 'number' },
        { field: 'contractPrice', width: 60, headerName: 'Price', type: 'number', valueFormatter: currencyFormatter },
        { field: 'lastContractPrice', width: 60, headerName: 'Price', type: 'number', valueFormatter: currencyFormatter },
        { field: 'buyCost', width: 70, headerName: 'Buy Cost', type: 'number', valueFormatter: fixedCurrencyFormatter },
        { field: 'sellCost', width: 70, headerName: 'Sell Cost', type: 'number', valueFormatter: fixedCurrencyFormatter },
        {
            field: 'actualProfit', width: 70, headerName: 'PnL', type: 'number', valueFormatter: fixedCurrencyFormatter,
            renderCell: (p) => <ConditionalFormattingBox value={p.value} formattedValue={p.formattedValue} />
        },
        {
            field: 'actualAnnualizedReturn', headerName: 'Annualized%', type: 'number', valueFormatter: percentageFormatter,
            renderCell: (p) => <ConditionalFormattingBox value={p.value * 1000} formattedValue={p.formattedValue} />
        },
        {
            field: 'actualProfitPerDay', width: 70, headerName: 'PnL/day', type: 'number', valueFormatter: currencyFormatter,
            renderCell: (p) => <ConditionalFormattingBox value={p.value * 10} formattedValue={p.formattedValue} />
        },
        {
            field: 'maximumRisk', width: 60, headerName: 'Risk', type: 'number', valueFormatter: fixedCurrencyFormatter,
            renderCell: (p) => <ConditionalFormattingBox value={-p.value / 100} formattedValue={p.formattedValue} />
        },
        {
            field: 'maximumProfit', width: 80, headerName: 'Max Profit', type: 'number', valueFormatter: fixedCurrencyFormatter,
            renderCell: (p) => <ConditionalFormattingBox value={p.value} formattedValue={p.formattedValue} />
        },
        {
            field: 'maxReturn', width: 120, headerName: 'Max Profit%', type: 'number',
            renderCell: (p) => {
                const fmValue = percentageFormatter(p.row.maxReturn) + '/' + percentageFormatter(p.row.maxAnnualizedReturn);
                return <ConditionalFormattingBox value={p.row.maxAnnualizedReturn * 1000} formattedValue={fmValue} />
            }
        },
        // { field: 'maxAnnualizedReturn', headerName: 'Max Annualized%', type: 'number', valueFormatter: percentageFormatter },
        {
            field: 'averageProfitPerDay', width: 100, headerName: 'Max Profit/day', type: 'number', valueFormatter: currencyFormatter,
            renderCell: (p) => <ConditionalFormattingBox value={p.value * 10} formattedValue={p.formattedValue} />
        },
        // { field: 'approxStockPriceAtPurchase', headerName: 'Price at transaction date', type: 'number', valueFormatter: currencyFormatter },
        {
            field: 'actions',
            type: 'actions',
            align: 'left',
            getActions: ({ id, row }) => {
                const actions = [<GridActionsCellItem
                    key='Remove'
                    icon={<DeleteIcon />}
                    label="Remove from my list"
                    title="Remove from my list"
                    onClick={() => handleDeleteTrade(row)}
                />];
                if (!row.isClosed) {
                    actions.push(<GridActionsCellItem
                        key='CloseContract'
                        icon={<CloseIcon />}
                        label="Close contract"
                        title="Close contract"
                        onClick={() => handleCloseContractClick(row)}
                    />);
                }
                return actions;
            }
        }
    ];
    const handleCloseCloseTrade = (reason: CloseTradeCloseDialogReason) => {
        if (currentTrade) {
            const closedTradeId = currentTrade.id;
            setOpenCloseTrade(false);
            setCurrentTrade(null);
            if (reason == 'close') reloadTrade(closedTradeId);
        }
    };
    columns.forEach(c => c.resizable = false);
    async function onDeleteTradeConfirm() {
        deleteTrade(deleteTradeId);
    }

    return <div>
        <FormControlLabel control={<Switch checked={showCloseTrades} onChange={(e, v) => toggleShowCloseTrades(v)} />} label="Show closed trades?" />
        <DataGrid rows={traderows}
            disableColumnMenu={true}
            disableColumnFilter={true}
            disableColumnSorting={true}
            columns={columns}
            density="compact"
            disableRowSelectionOnClick
            columnHeaderHeight={32}
            rowHeight={32}
            hideFooter={true}
            // showColumnVerticalBorder={true}
            // showCellVerticalBorder={true}
            // sx={{ display: 'grid' }}

            sx={{
                [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                    outline: 'none',
                },
                [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                {
                    outline: 'none',
                },
                [`& .${gridClasses.columnHeader}`]:
                {
                    fontSize: '0.7rem',
                    fontWeight: 500
                },
                [`& .${gridClasses.cell}`]:
                {
                    fontSize: '0.7rem',
                    padding: 0
                },
            }}
            style={{
                // fontSize: '12px'
            }}
            apiRef={apiRef} />
        {
            currentTrade && <CloseTradeDialog
                open={openCloseTrade}
                onClose={handleCloseCloseTrade}
                tradeId={currentTrade.id} />
        }

        {
            <ConfirmDialog text="Are you sure you want to delete this Trade?"
                title="Delete trade"
                open={isDeleteTradeOpen}
                onClose={() => setisDeleteTradeOpen(false)}
                onConfirm={onDeleteTradeConfirm}
            />
        }

    </div>
}
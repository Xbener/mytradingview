'use client';
import { ITradeView } from "@/lib/types";
import { shortDateFormatter } from "./trades";
import dayjs from "dayjs";

export const TickerName = (p: { trade: ITradeView; }) => {
    const { trade } = p;
    debugger;
    const dt = `${trade.contractExpiry}`.substring(0, 10);  //keeping only the date part
    const isYearAfter = dayjs(dt).diff(dayjs(), 'days') > 365;
    const fmtDate = isYearAfter ? dayjs(dt).format('M/D/YY') : dayjs(dt).format('M/D');
    return <div>
        {trade.symbol} {trade.strikePrice as unknown as string} {fmtDate} x {trade.numberOfContracts}
    </div>;
};

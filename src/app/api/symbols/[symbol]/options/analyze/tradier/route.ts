
import dayjs from 'dayjs';
import { NextResponse } from "next/server";
import { calculateHedging, getCalculatedStrikes } from "@/lib/dgHedgingHelper";
import { getCurrentPrice, getOptionData, getOptionExpirations } from '@/lib/tradierService';

export async function GET(request: Request, p: { params: { symbol: string } }) {
  const { searchParams } = new URL(request.url);
  const dteValue = parseInt(searchParams.get("dte") || '30');
  const strikeCountValue = parseInt(searchParams.get("sc") || '30');
  console.log(`calling with ${dteValue} dtes`);
  const { symbol } = p.params;
  const currentPrice = await getCurrentPrice(symbol);
  if (!currentPrice) throw new Error('Unable to evaluate current price')

  const expresp = await getOptionExpirations(symbol);

  const tillDate = dayjs().add(dteValue, 'days');
  console.log(`all expirations: ${expresp.expirations.date}`);
  const allDates = [...new Set(expresp.expirations.date.filter(j => dayjs(j).isBefore(tillDate)))];
  const allOptionChains = await Promise.all(allDates.map(d => getOptionData(symbol, d)));

  const allStrikes = getCalculatedStrikes(currentPrice, strikeCountValue, [...new Set(allOptionChains.flatMap(j => j.options.option.map(s => s.strike)))]);
  const finalResponse = calculateHedging(allOptionChains, allStrikes, allDates, currentPrice)
  return NextResponse.json(finalResponse);
}
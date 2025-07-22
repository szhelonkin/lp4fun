import {
    Connection,
    PublicKey,
} from '@solana/web3.js';
import DLMM, {LbPosition} from '@meteora-ag/dlmm';
import {PoolData, PositionData, WalletData} from "@/app/types";
import {fetchTokenPrice} from "@/app/utils/jup";
import {bnToDate} from "@/app/utils/numberFormatting";
import {formatTokenBalance} from "@/app/utils/solana";

async function main() {
	//console.log("gggg")
	const connection = new Connection("https://rpc-proxy.segfaultx0.workers.dev", "confirmed");
	const wallet = "EsERgaixLf9ynvrdSs39hysC3jGMHUspoZrLgAteV9fR"
	const user = new PublicKey(wallet);
	const positions = await DLMM.getAllLbPairPositionsByUser(connection, user);
	//console.log(positions);
	const map = new Map<string, PositionData[]>();
	await Promise.all(Array.from(positions.entries()).map(async ([key, position]) => {
		//const tokenInfo = await fetchTokenPrice(position.tokenX.publicKey, position.tokenY.publicKey);
		//console.log(tokenInfo);
		const tokenDecimalX = position.tokenX.mint.decimals;
        const tokenDecimalY = position.tokenY.mint.decimals;
        const lbPairPositionsData = position.lbPairPositionsData.map((pos: LbPosition): PositionData => {
            const claimedFeeXAmount = pos.positionData.totalClaimedFeeXAmount.toString();
            const claimedFeeYAmount = pos.positionData.totalClaimedFeeYAmount.toString();

            return {
                lastUpdatedAt: bnToDate(pos.positionData.lastUpdatedAt),
                totalXAmount: formatTokenBalance(BigInt(pos.positionData.totalXAmount.split('.')[0]), tokenDecimalX),
                totalYAmount: formatTokenBalance(BigInt(pos.positionData.totalYAmount.split('.')[0]), tokenDecimalY),
                feeX: formatTokenBalance(BigInt(pos.positionData.feeX.toString()), tokenDecimalX),
                feeY: formatTokenBalance(BigInt(pos.positionData.feeY.toString()), tokenDecimalY),
                publicKey: pos.publicKey.toString(),
                lowerBinId: pos.positionData.lowerBinId,
                upperBinId: pos.positionData.upperBinId,
                claimedFeeXAmount,
                claimedFeeYAmount,
                claimedFeeX: formatTokenBalance(BigInt(claimedFeeXAmount), tokenDecimalX),
                claimedFeeY: formatTokenBalance(BigInt(claimedFeeYAmount), tokenDecimalY),
            };
        });
        //console.log(lbPairPositionsData);
        map.set(key, 
            lbPairPositionsData
        );
	}));
	//console.log(map);
	//console.log([...map]);
	console.log(Object.fromEntries(map));
}

main().catch(console.error);

import { paymentMiddleware, x402ResourceServer } from '@x402-avm/express';
import { HTTPFacilitatorClient } from '@x402-avm/core/server';
import { registerExactAvmScheme } from '@x402-avm/avm/exact/server';
import 'dotenv/config';

const facilitator = new HTTPFacilitatorClient({ 
    url: process.env.FACILITATOR_URL || 'https://facilitator.goplausible.xyz'
});
const x402Server = new x402ResourceServer(facilitator);
registerExactAvmScheme(x402Server);

const ALGORAND_TESTNET = "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";

export const requirePayment = (amount) => {
    return paymentMiddleware(
        {
            "*": {
                accepts: [
                    {
                        scheme: 'exact',
                        network: ALGORAND_TESTNET,
                        payTo: process.env.ALGORAND_RECEIVER_WALLET,
                        price: amount.toString() 
                    }
                ],
                description: "Booking settlement"
            }
        },
        x402Server
    );
};
import { DOT, ActiveStakedRelayer } from "../../../src/interfaces/default";
import { AccountId } from "@polkadot/types/interfaces/runtime";
import { ApiPromise } from "@polkadot/api";
import { assert } from "../../chai";
import { StakedRelayerAPI, DefaultStakedRelayerAPI } from "../../../src/apis/staked-relayer";
import { createPolkadotAPI } from "../../../src/factory";
import BN from "bn.js";
import sinon from "sinon";

describe("stakedRelayerAPI", () => {
    function numberToDOT(x: number): DOT {
        return new BN(x) as DOT;
    }

    describe.skip("request", () => {
        let api: ApiPromise;
        let stakedRelayerAPI: StakedRelayerAPI;

        beforeEach(async () => {
            const defaultEndpoint = "ws://127.0.0.1:9944";
            api = await createPolkadotAPI(defaultEndpoint);
            stakedRelayerAPI = new DefaultStakedRelayerAPI(api);
        });

        afterEach(() => {
            return api.disconnect();
        });

        it("should getStakedDOTAmount", async () => {
            sinon
                .stub(stakedRelayerAPI, "get")
                .returns(Promise.resolve(<ActiveStakedRelayer>{ stake: new BN(100) as DOT }));
            const activeStakedRelayerId = <AccountId>{};
            const stakedDOTAmount: DOT = await stakedRelayerAPI.getStakedDOTAmount(activeStakedRelayerId);
            assert.equal(stakedDOTAmount.toNumber(), 100);
        });

        it("should compute totalStakedDOTAmount with nonzero sum", async () => {
            const mockStakedDOTAmounts: DOT[] = [1, 2, 3].map((x) => numberToDOT(x));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sinon.stub(stakedRelayerAPI, <any>"getStakedDOTAmounts").returns(Promise.resolve(mockStakedDOTAmounts));
            const totalStakedDOTAmount: BN = await stakedRelayerAPI.getTotalStakedDOTAmount();
            assert.equal(totalStakedDOTAmount.toNumber(), 6);
        });

        it("should compute totalStakedDOTAmount with zero sum", async () => {
            const mockStakedDOTAmounts: DOT[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sinon.stub(stakedRelayerAPI, <any>"getStakedDOTAmounts").returns(Promise.resolve(mockStakedDOTAmounts));
            const totalStakedDOTAmount = await stakedRelayerAPI.getTotalStakedDOTAmount();
            assert.equal(totalStakedDOTAmount.toNumber(), 0);
        });

        // commented because function is only a stub now
        // it("should getFeesEarned", async () => {
        //     const feesEarned = await stakedRelayerAPI.getFeesEarned();
        //     assert.notEqual(typeof(feesEarned), undefined);
        // });

        it("should getLatestBTCBlockFromBTCRelay", async () => {
            const latestBTCBlockFromBTCRelay = await stakedRelayerAPI.getLatestBTCBlockFromBTCRelay();
            assert.notEqual(typeof latestBTCBlockFromBTCRelay, undefined);
        });

        it("should getLatestBTCBlockHeightFromBTCRelay", async () => {
            const latestBTCBlockHeightFromBTCRelay = await stakedRelayerAPI.getLatestBTCBlockHeightFromBTCRelay();
            assert.notEqual(typeof latestBTCBlockHeightFromBTCRelay, undefined);
        });

        it("should getLatestBTCBlockFromBTCCore", async () => {
            const latestBTCBlockFromBTCCore = await stakedRelayerAPI.getLatestBTCBlockFromBTCCore();
            assert.notEqual(typeof latestBTCBlockFromBTCCore, undefined);
        });

        it("should getMonitoredVaultsCollateralizationRate", async () => {
            const monitoredVaultsCollateralizationRate =
                await stakedRelayerAPI.getMonitoredVaultsCollateralizationRate();
            assert.notEqual(typeof monitoredVaultsCollateralizationRate, undefined);
        });

        it("should getLastBTCDOTExchangeRateAndTime", async () => {
            const lastBTCDOTExchangeRateAndTime = await stakedRelayerAPI.getLastBTCDOTExchangeRateAndTime();
            assert.notEqual(typeof lastBTCDOTExchangeRateAndTime, undefined);
        });

        it("should getCurrentStateOfBTCParachain", async () => {
            const currentStateOfBTCParachain = await stakedRelayerAPI.getCurrentStateOfBTCParachain();
            assert.notEqual(typeof currentStateOfBTCParachain, undefined);
        });

        it("should getOngoingStatusUpdateVotes", async () => {
            const ongoingStatusUpdateVotes = await stakedRelayerAPI.getOngoingStatusUpdateVotes();
            assert.notEqual(typeof ongoingStatusUpdateVotes, undefined);
        });

        it("should getAllStatusUpdates", async () => {
            const allStatusUpdates = await stakedRelayerAPI.getAllStatusUpdates();
            assert.notEqual(typeof allStatusUpdates, undefined);
        });
    });
});

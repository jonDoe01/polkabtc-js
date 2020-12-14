import { ApiPromise } from "@polkadot/api";
import { TypeRegistry } from "@polkadot/types";
import { BTreeSet, Raw } from "@polkadot/types/codec";
import { AccountId } from "@polkadot/types/interfaces";
import BN from "bn.js";
import sinon from "sinon";
import { DefaultOracleAPI, OracleAPI } from "../../../src/apis/oracle";
import { createAPIRegistry } from "../../../src/factory";
import { ErrorCode } from "../../../src/interfaces/default";
import { assert } from "../../chai";

describe("oracle", () => {
    const exchangeRate = 300000000;
    const lastRate = new Date(2020, 8, 1);
    let oracle: OracleAPI;
    let errors: ErrorCode[];
    let registry: TypeRegistry;

    const makeStubs = () => {
        registry = createAPIRegistry();
        const timestamp = new BN(Math.floor(lastRate.getTime() / 1000));
        return {
            exchangeRateOracle: {
                exchangeRate: () => Promise.resolve(new BN(exchangeRate)),
                lastExchangeRateTime: () => Promise.resolve(timestamp),
                authorizedOracles: {
                    entries: () => Promise.resolve([[1, new Raw(registry, "test")]]),
                },
            },
            security: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                errors: () => {
                    const stateErrors = new BTreeSet(registry, "ErrorCode");
                    if (errors) {
                        errors.forEach((e) => stateErrors.add(e));
                    }
                    return Promise.resolve(stateErrors);
                },
            },
        };
    };

    beforeEach(async () => {
        const api = sinon.createStubInstance(ApiPromise);
        sinon.stub(api, "query").get(() => makeStubs());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oracle = new DefaultOracleAPI(<any>api);
    });

    describe("getExchangeRate", () => {
        it("should scale exchange rate", () => {
            return assert.eventually.equal(oracle.getExchangeRate(), 3000000);
        });
    });

    describe("getFeed", () => {
        it("should return constant value", () => {
            return assert.eventually.equal(oracle.getFeed(), "DOT/BTC");
        });
    });

    describe("getLastExchangeRateTime", () => {
        it("should return result as a date", () => {
            const expected = Math.floor(lastRate.getTime() / 1000);
            const actual = oracle.getLastExchangeRateTime().then((v) => v.getTime());
            return assert.eventually.equal(actual, expected);
        });
    });

    describe("isOnline", () => {
        it("should return true if there is no error", () => {
            return assert.eventually.isTrue(oracle.isOnline());
        });

        it("should return false if there is an oracle error", () => {
            const oracleError = registry.createType("ErrorCode", { oracleoffline: true });
            errors = [oracleError];
            return assert.eventually.isFalse(oracle.isOnline());
        });

        it("should return true if there is an other error", () => {
            const oracleError = registry.createType("ErrorCode", { invalidbtcrelay: true });
            errors = [oracleError];
            return assert.eventually.isTrue(oracle.isOnline());
        });
    });

    describe("oracleName", () => {
        it("should return name", () => {
            return assert.eventually.deepEqual(oracle.getOracleNames(), ["test"]);
        });
    });

    describe("convert exchange rate", () => {
        it("should return the correct rate", () => {
            const oracleProto = Object.getPrototypeOf(oracle);
            const planck_to_sat = 38552318793;
            const dot_to_btc = oracleProto.convertFromRawExchangeRate(planck_to_sat);
            return assert.equal(dot_to_btc, 385523187.93);
        });
    });
});

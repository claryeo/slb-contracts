// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const {ethers} = require('hardhat');

describe('SLB_Bond contract', function () {
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addrs;

    let bond;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

        // Deploy Contract
        const SLB_Bond = await ethers.getContractFactory('SLB_Bond');
        bond = await SLB_Bond.deploy();
        console.log('SLB_Bond contract address: ' + bond.address);
    });

    describe("SLB_Bond tests", function () {
        it("test initial status", async function () {
            expect((await bond.connect(owner).status()).toString()).to.equal("0");
        });

        it("test set roles", async function () {
            const roles = await bond.connect(owner).setRoles("0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", 
                                "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db");
            console.log('transaction hash: ' + roles.hash);
            await roles.wait();
            expect((await bond.connect(owner).issuer()).toString()).to.equal("0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2");
            expect((await bond.connect(owner).verifier()).toString()).to.equal("0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db");
        });

        it("test set and mint bond", async function () {
            const roles = await bond.connect(owner).setRoles(addr1.getAddress(), addr2.getAddress());
            let now = new Date(Date.now());
            let nowUnix = Math.floor(now.getTime() / 1000);
            const newBond = await bond.connect(addr1).setBond("Bond 1, KPI: Greenhouse gas emissions",
                                [1,0,0],
                                100, 
                                1, 
                                10, 
                                5, 
                                100, 
                                (nowUnix + 10000),
                                (nowUnix + 20000),
                                (nowUnix + 30000));
            console.log('transaction hash: ' + newBond.hash);
            await newBond.wait();
            const buyBond = await bond.connect(addr3).mintBond(20);
            await buyBond.wait();
            expect((await bond.connect(addr3).bondsForSale()).toString()).to.equal("80");
        });

        it("test set bond active", async function () {
            const roles = await bond.connect(owner).setRoles(addr1.getAddress(), addr2.getAddress());
            let now = new Date(Date.now());
            let nowUnix = Math.floor(now.getTime() / 1000);
            const newBond = await bond.connect(addr1).setBond("Bond 1, KPI: Greenhouse gas emissions",
                                [1,0,0],
                                100, 
                                1, 
                                10, 
                                5, 
                                100, 
                                (nowUnix),
                                (nowUnix + 20000),
                                (nowUnix + 30000));
            console.log('transaction hash: ' + newBond.hash);
            await newBond.wait();
            expect((await bond.connect(addr1).status()).toString()).to.equal("1");
            const bondActive = await bond.connect(addr1).setBondActive();
            await bondActive.wait();
            expect((await bond.connect(addr1).status()).toString()).to.equal("2");
        });

        it("test fund bond and withdraw funds", async function () {
            const roles = await bond.connect(owner).setRoles(addr1.getAddress(), addr2.getAddress());
            const addFunds = await bond.connect(addr1).fundBond({
                value: ethers.utils.parseUnits("2","wei")
            });
            await addFunds.wait();
            expect((await bond.connect(owner).getBalance()).toString()).to.equal("2");
            const withdrawFunds = await bond.connect(addr1).withdrawMoney(ethers.utils.parseUnits("1","wei"));
            await withdrawFunds.wait();
            expect((await bond.connect(owner).getBalance()).toString()).to.equal("1");
        });

        it("test report and verify impact", async function () {
            const roles = await bond.connect(owner).setRoles(addr1.getAddress(), addr2.getAddress());
            let now = new Date(Date.now());
            let nowUnix = Math.floor(now.getTime() / 1000);
            const newBond = await bond.connect(addr1).setBond("Bond 1, KPI: Greenhouse gas emissions",
                                [1,0,0],
                                100, 
                                1, 
                                10, 
                                5, 
                                100, 
                                (nowUnix),
                                (nowUnix + 1),
                                (nowUnix + 2));
           
            await newBond.wait();
            const bondActive = await bond.connect(addr1).setBondActive();
            await bondActive.wait();

            const deviceRegister = await bond.connect(addr1).registerDevice("123");
            await deviceRegister.wait();

            const deviceHash = await bond.connect(addr1).hash("123", addr1.getAddress());
            
            expect((await bond.connect(addr1).checkDevice("123", deviceHash))).to.equal(true);

            const bondReport = await bond.connect(addr1).reportImpact(1,2,3,"123", deviceHash);
            await bondReport.wait();

            expect((await bond.connect(addr1).currentPeriod()).toString()).to.equal("1");
            expect((await bond.connect(addr1).isReported()).toString()).to.equal("true");

            const bondVerify = await bond.connect(addr2).verifyImpact(true);
            await bondVerify.wait();
            expect((await bond.connect(addr2).isVerified()).toString()).to.equal("true");
            
        });

        it("test regulator (transfer ownership, freeze and unfreeze bond)", async function () {
            const roles = await bond.connect(owner).setRoles(addr1.getAddress(), addr2.getAddress());
            const transferBond = await bond.connect(owner).transferOwnership(addr4.getAddress());
            const freeze = await bond.connect(addr4).freezeBond();
            await freeze.wait();

            expect((await bond.connect(addr4).paused()).toString()).to.equal("true");

            const unfreeze = await bond.connect(addr4).unfreezeBond();
            await unfreeze.wait();

            expect((await bond.connect(addr4).paused()).toString()).to.equal("false");
        });

    });


});

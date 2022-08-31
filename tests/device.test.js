// Right click on the script name and hit "Run" to execute
const { expect } = require("chai");
const {ethers} = require('hardhat');

describe('IoT_Device contract', function () {
    let owner;
    let addrs;

    let device;

    beforeEach(async function () {
        [owner, ...addrs] = await ethers.getSigners();

        // Deploy Contract
        const IoT_Device = await ethers.getContractFactory('IoT_Device');
        device = await IoT_Device.deploy();
        console.log('IoT_Device contract address: ' + device.address);
    });

    describe("IoT_Device tests", function () {

      it("test device registration", async function () {
        const deviceRegister = await device.connect(owner).registerDevice("123");
        console.log('transaction hash: ' + deviceRegister.hash);
        await deviceRegister.wait();
        const ownerAddress = await owner.getAddress();
        expect((await device.connect(owner).findDeviceOwner("123")).toString()).to.equal(ownerAddress);
      });

        it("test device verification", async function () {
        const deviceRegister = await device.connect(owner).registerDevice("123");
        console.log('transaction hash: ' + deviceRegister.hash);
        await deviceRegister.wait();
        const deviceHash = await device.connect(owner).hash("123", owner.getAddress(), 1, 2 , 3);
        expect((await device.connect(owner).checkDevice("123", deviceHash, 1, 2, 3))).to.equal(true);
      });

  });

});
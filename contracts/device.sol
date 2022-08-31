// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;


contract IoT_Device{
    
    mapping(string => address) deviceOwner;
    // mapping (string => bytes32) devicePassword;

    event RegisteredDevice(string imei, address owner);

    //to include impact data arguments
    function hash(
        string memory _imei,
        address _addr
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_imei, _addr));
    }

    //Registration find function
    function findDeviceOwner(string memory _imei) public view returns (address) {
        return (deviceOwner[_imei]);
    }

    // Avoid
    // function findDevicePassword(string memory _imei) internal view returns (bytes32) {
    //     return (devicePassword[_imei]);
    // }

    //Pebble setFirmware function
    //Registration setOwner function
    function registerDevice(string memory _imei) public {
        address owner = findDeviceOwner(_imei);
        require(owner != msg.sender, "device is registered");
        deviceOwner[_imei] = msg.sender;
        
        // bytes32 password = hash(_imei, msg.sender);
        // devicePassword[_imei] = password;

        emit RegisteredDevice(_imei, msg.sender);
    }

    //Pebble recover function
    function checkDevice(string memory _imei, bytes32 _signature) public view returns (bool){
        address owner = findDeviceOwner(_imei);
        require(owner == msg.sender, "caller is not owner");
        if(hash(_imei, msg.sender) == _signature){
            return true;
        }
        else{
            return false;
        }
    }

}